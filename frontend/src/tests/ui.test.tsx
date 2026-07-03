import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/components/ui';

describe('Button', () => {
  it('renders accessible button text', () => {
    render(<Button>Lưu</Button>);
    expect(screen.getByRole('button', { name: 'Lưu' })).toBeInTheDocument();
  });
});
