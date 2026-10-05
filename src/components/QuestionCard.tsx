import QACard from '@/components/QACard';
import type { QuestionRow } from '@/lib/types';

export default function QuestionCard({ q }: { q: QuestionRow }) {
  return <QACard q={q} />;
}
