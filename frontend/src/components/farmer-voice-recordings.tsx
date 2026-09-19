'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Mic, Square, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Button, Input, Textarea } from './ui';

type FarmerVoiceRecording = {
  id: string;
  title: string | null;
  transcript: string | null;
  durationSeconds: number;
  consentedAt: string;
  createdAt: string;
  downloadUrl: string;
  recordedBy: { id: string; fullName: string } | null;
};

const RECORDING_LIMIT_SECONDS = 600;
const MAX_RECORDING_BYTES = 18 * 1024 * 1024;
const MIME_PREFERENCES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex?: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function FarmerVoiceRecordings({
  farmerId,
  farmerName,
  canRecord,
  onClose
}: {
  farmerId: string;
  farmerName: string;
  canRecord: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [title, setTitle] = useState('');
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [recordError, setRecordError] = useState('');
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recordingRef = useRef(false);
  const finalTranscriptRef = useRef('');
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const recordings = useQuery({
    queryKey: ['farmer-voice-recordings', farmerId],
    queryFn: () => apiFetch<FarmerVoiceRecording[]>(`/users/${encodeURIComponent(farmerId)}/voice-recordings`)
  });

  const saveRecording = useMutation({
    mutationFn: () => {
      if (!audioFile) throw new Error('Hãy ghi âm trước khi lưu.');
      const payload = new FormData();
      payload.append('audio', audioFile, audioFile.name);
      payload.append('title', title.trim());
      payload.append('transcript', transcript.trim());
      payload.append('durationSeconds', String(Math.max(1, elapsedSeconds)));
      payload.append('consentConfirmed', 'true');
      return apiFetch<FarmerVoiceRecording>(`/users/${encodeURIComponent(farmerId)}/voice-recordings`, {
        method: 'POST',
        body: payload
      });
    },
    onSuccess: async () => {
      setAudioFile(null);
      setTitle('');
      setTranscript('');
      finalTranscriptRef.current = '';
      setElapsedSeconds(0);
      setConsentConfirmed(false);
      await queryClient.invalidateQueries({ queryKey: ['farmer-voice-recordings', farmerId] });
    }
  });

  const deleteRecording = useMutation({
    mutationFn: (recordingId: string) => apiFetch<{ deleted: boolean }>(
      `/users/${encodeURIComponent(farmerId)}/voice-recordings/${encodeURIComponent(recordingId)}`,
      { method: 'DELETE' }
    ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['farmer-voice-recordings', farmerId] })
  });

  useEffect(() => {
    const speechWindow = window as SpeechRecognitionWindow;
    setSpeechSupported(Boolean(speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    if (!audioFile) {
      setPreviewUrl('');
      return;
    }
    const url = URL.createObjectURL(audioFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    recordingRef.current = false;
    speechRecognitionRef.current?.stop();
    speechRecognitionRef.current = null;
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  function startSpeechRecognition() {
    const speechWindow = window as SpeechRecognitionWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = '';
      const startIndex = event.resultIndex ?? 0;
      for (let index = startIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript?.trim();
        if (!text) continue;
        if (result.isFinal) {
          finalTranscriptRef.current = [finalTranscriptRef.current, text].filter(Boolean).join(' ');
        } else {
          interim = [interim, text].filter(Boolean).join(' ');
        }
      }
      setTranscript([finalTranscriptRef.current, interim].filter(Boolean).join(' '));
    };
    recognition.onerror = (event) => {
      setSpeechError(event.error === 'not-allowed'
        ? 'Trình duyệt chưa cho phép nhận dạng giọng nói; bạn vẫn có thể nhập nội dung bên dưới.'
        : 'Không nhận dạng được giọng nói; bạn vẫn có thể nhập hoặc sửa nội dung bên dưới.');
    };
    recognition.onend = () => {
      if (!recordingRef.current) return;
      try {
        recognition.start();
      } catch {
        // Một số trình duyệt báo đang khởi động khi tự nối lại; không làm gián đoạn file âm thanh.
      }
    };
    speechRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      speechRecognitionRef.current = null;
      setSpeechError('Không bật được nhận dạng giọng nói; bạn vẫn có thể nhập hoặc sửa nội dung bên dưới.');
    }
  }

  function stopSpeechRecognition() {
    const recognition = speechRecognitionRef.current;
    speechRecognitionRef.current = null;
    try {
      recognition?.stop();
    } catch {
      // Recognition may already have stopped after a browser permission change.
    }
  }

  function stopRecording() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    recordingRef.current = false;
    stopSpeechRecognition();
    const recorder = mediaRecorderRef.current;
    if (recorder?.state === 'recording') recorder.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setRecording(false);
  }

  async function startRecording() {
    setRecordError('');
    setAudioFile(null);
    setTranscript('');
    finalTranscriptRef.current = '';
    setSpeechError('');
    setElapsedSeconds(0);
    if (!consentConfirmed) {
      setRecordError('Vui lòng xác nhận đã thông báo và được nông dân đồng ý ghi âm.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setRecordError('Trình duyệt này chưa hỗ trợ ghi âm. Hãy dùng Chrome, Edge hoặc Safari phiên bản mới.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mimeType = MIME_PREFERENCES.find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => setRecordError('Có lỗi khi thu âm. Hãy thử ghi lại.');
      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType?.split(';')[0] || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        if (!blob.size) {
          setRecordError('Không thu được âm thanh. Hãy kiểm tra micro rồi ghi lại.');
          return;
        }
        if (blob.size > MAX_RECORDING_BYTES) {
          setRecordError('Tệp ghi âm vượt quá 18 MB. Hãy ghi đoạn ngắn hơn.');
          return;
        }
        const extension = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm';
        setAudioFile(new File([blob], `ghi-am-nong-ho.${extension}`, { type }));
      };
      startedAtRef.current = Date.now();
      recorder.start(1000);
      recordingRef.current = true;
      setRecording(true);
      startSpeechRecognition();
      timerRef.current = window.setInterval(() => {
        const seconds = Math.min(RECORDING_LIMIT_SECONDS, Math.floor((Date.now() - startedAtRef.current) / 1000));
        setElapsedSeconds(seconds);
        if (seconds >= RECORDING_LIMIT_SECONDS) stopRecording();
      }, 500);
    } catch (error) {
      recordingRef.current = false;
      stopSpeechRecognition();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setRecordError(error instanceof Error && error.name === 'NotAllowedError'
        ? 'Chưa được cấp quyền dùng micro. Hãy cho phép micro trong trình duyệt rồi thử lại.'
        : 'Không mở được micro. Kiểm tra thiết bị và thử lại.');
    }
  }

  function close() {
    if (recording) return;
    onClose();
  }

  const items = recordings.data?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/60 p-3 sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !recording && !saveRecording.isPending) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="farmer-voice-title" className="relative my-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <Button type="button" variant="ghost" aria-label="Đóng ghi âm" className="absolute right-3 top-3" onClick={close} disabled={recording || saveRecording.isPending}>
          <X size={18} aria-hidden="true" />
        </Button>
        <div className="pr-10">
          <p className="text-xs font-semibold uppercase tracking-wide text-leaf">Hồ sơ riêng tư</p>
          <h2 id="farmer-voice-title" className="mt-1 text-xl font-bold text-ink">Ghi âm · {farmerName}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">Ghi lại trao đổi về mùa vụ, giống cây hoặc nhu cầu hỗ trợ. Âm thanh không xuất hiện trên QR cá nhân.</p>
        </div>

        {canRecord ? (
          <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="flex items-start gap-3 text-sm leading-5 text-slate-700">
              <input
                data-testid="farmer-recording-consent"
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-700"
                checked={consentConfirmed}
                disabled={recording || saveRecording.isPending}
                onChange={(event) => setConsentConfirmed(event.target.checked)}
              />
              <span>Tôi đã thông báo cho nông dân và được họ đồng ý ghi âm cuộc trao đổi này.</span>
            </label>
            {speechSupported ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Nhận dạng tiếng Việt do trình duyệt cung cấp và có thể dùng dịch vụ xử lý của trình duyệt. Chỉ bật khi nông dân đã đồng ý; bạn có thể xóa transcript trước khi lưu.</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              {!recording ? (
                <Button data-testid="farmer-recording-start" type="button" onClick={() => void startRecording()} disabled={!consentConfirmed || saveRecording.isPending}>
                  <Mic size={17} aria-hidden="true" />Bắt đầu ghi âm
                </Button>
              ) : (
                <Button data-testid="farmer-recording-stop" type="button" variant="danger" onClick={stopRecording}>
                  <Square size={16} aria-hidden="true" />Dừng ghi âm
                </Button>
              )}
              <span aria-live="polite" className="text-sm tabular-nums text-slate-600">{recording ? 'Đang ghi' : audioFile ? 'Đã thu' : 'Sẵn sàng'} · {formatDuration(elapsedSeconds)} / 10:00</span>
            </div>
            {audioFile ? (
              <div className="space-y-3 border-t border-slate-200 pt-3">
                <label className="block space-y-1 text-sm font-medium text-slate-700">
                  Tên bản ghi <span className="font-normal text-slate-500">(không bắt buộc)</span>
                  <Input value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)} placeholder="Ví dụ: Trao đổi kế hoạch vụ xoài" />
                </label>
                <label className="block space-y-1 text-sm font-medium text-slate-700">
                  Nội dung chuyển thành văn bản <span className="font-normal text-slate-500">(có thể sửa)</span>
                  <Textarea
                    data-testid="farmer-recording-transcript"
                    rows={4}
                    maxLength={20000}
                    value={transcript}
                    onChange={(event) => setTranscript(event.target.value)}
                    placeholder={speechSupported ? 'Hệ thống sẽ nhận dạng tiếng Việt khi đang ghi…' : 'Trình duyệt chưa hỗ trợ tự nhận dạng; nhập nội dung tại đây nếu cần.'}
                  />
                  <span className="block text-xs font-normal leading-5 text-slate-500">{speechSupported ? 'Nhận dạng tiếng Việt chạy song song với file âm thanh; hãy rà lại trước khi lưu.' : 'File âm thanh vẫn được lưu bình thường, kể cả khi không có nhận dạng tự động.'}</span>
                </label>
                {speechError ? <p role="status" className="text-xs leading-5 text-amber-700">{speechError}</p> : null}
                {previewUrl ? <audio controls preload="metadata" src={previewUrl} className="w-full" aria-label="Nghe thử bản ghi âm" /> : null}
                <div className="flex flex-wrap gap-2">
                  <Button data-testid="farmer-recording-save" type="button" onClick={() => saveRecording.mutate()} disabled={saveRecording.isPending}>
                    {saveRecording.isPending ? 'Đang lưu bản ghi…' : 'Lưu vào hồ sơ'}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setAudioFile(null); setTranscript(''); finalTranscriptRef.current = ''; setElapsedSeconds(0); setSpeechError(''); saveRecording.reset(); }} disabled={saveRecording.isPending}>Ghi lại</Button>
                </div>
              </div>
            ) : null}
            <p className="text-xs leading-5 text-slate-500">Tệp được lưu riêng tư, tối đa 10 phút và 18 MB để upload ổn định. Chỉ người có quyền quản lý tài khoản trong HTX mới nghe hoặc xóa được.</p>
          </div>
        ) : (
          <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Tài khoản nông dân này đang tạm dừng/khóa nên không thể thêm bản ghi mới. Các bản ghi cũ vẫn được quản lý tại đây.</p>
        )}

        {recordError ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{recordError}</p> : null}
        {saveRecording.isError ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorMessage(saveRecording.error)} Bản ghi vẫn còn trên thiết bị; có thể thử lưu lại.</p> : null}
        {deleteRecording.isError ? <p role="alert" className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{errorMessage(deleteRecording.error)}</p> : null}
        {recordings.isError ? (
          <div role="alert" className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">
            {errorMessage(recordings.error)} <button type="button" className="ml-1 underline" onClick={() => void recordings.refetch()}>Tải lại</button>
          </div>
        ) : null}

        <div className="mt-5 border-t border-slate-200 pt-4">
          <h3 className="text-sm font-semibold text-ink">Bản ghi đã lưu <span className="font-normal text-slate-500">({items.length})</span></h3>
          {recordings.isLoading ? <p role="status" className="py-4 text-sm text-slate-500">Đang tải bản ghi…</p> : null}
          {!recordings.isLoading && !recordings.isError && items.length === 0 ? <p className="py-4 text-sm text-slate-500">Chưa có bản ghi âm nào.</p> : null}
          {items.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {items.map((item) => (
                <li key={item.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-medium text-ink">{item.title || 'Bản ghi âm'}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)} · {formatDuration(item.durationSeconds)}{item.recordedBy ? ` · ${item.recordedBy.fullName}` : ''}</p>
                    </div>
                    <Button type="button" variant="ghost" aria-label={`Xóa bản ghi ${item.title || 'âm thanh'}`} disabled={deleteRecording.isPending} onClick={() => {
                      if (window.confirm('Xóa vĩnh viễn bản ghi âm này?')) deleteRecording.mutate(item.id);
                    }}>
                      <Trash2 size={16} aria-hidden="true" />Xóa
                    </Button>
                  </div>
                  <audio controls preload="none" src={item.downloadUrl} className="mt-3 w-full" aria-label={`Nghe ${item.title || 'bản ghi âm'}`} />
                  {item.transcript ? <p data-testid={`farmer-recording-transcript-${item.id}`} className="mt-3 whitespace-pre-wrap rounded-md bg-slate-50 p-2.5 text-sm leading-6 text-slate-700"><span className="font-medium text-ink">Nội dung:</span> {item.transcript}</p> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function formatDuration(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Không thể xử lý yêu cầu.';
}
