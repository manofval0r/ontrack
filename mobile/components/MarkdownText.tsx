/** Minimal markdown renderer for AI message text — bold, italic, inline
 * code, headers, bullets, and numbered lists as styled native Text.
 * Deliberately dependency-free (OTA-safe): links render as plain teal text,
 * tables/HTML fall through as-is rather than crashing. */
import { Text, View } from 'react-native';
import { useTheme } from '../lib/theme';

type Seg = { text: string; bold?: boolean; italic?: boolean; code?: boolean };

function parseInline(s: string): Seg[] {
  const out: Seg[] = [];
  // code first so asterisks inside backticks survive
  const parts = s.split(/(`[^`]+`)/g);
  for (const part of parts) {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      out.push({ text: part.slice(1, -1), code: true });
      continue;
    }
    const subs = part.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    for (const sub of subs) {
      if (!sub) continue;
      if (sub.startsWith('**') && sub.endsWith('**') && sub.length > 4) {
        out.push({ text: sub.slice(2, -2), bold: true });
      } else if (sub.startsWith('*') && sub.endsWith('*') && sub.length > 2) {
        out.push({ text: sub.slice(1, -1), italic: true });
      } else {
        out.push({ text: sub });
      }
    }
  }
  return out.filter((seg) => seg.text.length > 0);
}

export function MarkdownText({ content, color, fontSize = 17, lineHeight = 25 }: {
  content: string;
  color: string;
  fontSize?: number;
  lineHeight?: number;
}) {
  const t = useTheme();
  const lines = content.split('\n');

  const renderSegs = (segs: Seg[], keyBase: string) =>
    segs.map((seg, j) => (
      <Text
        key={`${keyBase}-${j}`}
        style={{
          fontWeight: seg.bold ? '800' : undefined,
          fontStyle: seg.italic ? 'italic' : undefined,
          backgroundColor: seg.code ? t.inputTrack : undefined,
          borderRadius: seg.code ? 4 : undefined,
          color: seg.code ? t.teal : undefined,
          fontSize: seg.code ? fontSize - 2 : undefined,
        }}
      >
        {seg.text}
      </Text>
    ));

  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = (key: string) => {
    if (!list) return;
    const items = list.items;
    const ordered = list.ordered;
    list = null;
    blocks.push(
      <View key={key} style={{ gap: 2, marginVertical: 2 }}>
        {items.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontSize, lineHeight, color: t.teal, fontWeight: '800', minWidth: ordered ? 20 : undefined }}>
              {ordered ? `${i + 1}.` : '•'}
            </Text>
            <Text style={{ flex: 1, fontSize, lineHeight, color }}>{renderSegs(parseInline(item), `${key}-li${i}`)}</Text>
          </View>
        ))}
      </View>
    );
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    const ordered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!list || list.ordered) {
        flushList(`list-${i}`);
        list = { ordered: false, items: [] };
      }
      list.items.push(trimmed.slice(2));
      return;
    }
    if (ordered) {
      if (!list || !list.ordered) {
        flushList(`list-${i}`);
        list = { ordered: true, items: [] };
      }
      list.items.push(ordered[2]);
      return;
    }
    flushList(`list-${i}`);
    const h3 = trimmed.match(/^###\s+(.*)$/);
    const h2 = trimmed.match(/^##\s+(.*)$/);
    if (h3 || h2) {
      blocks.push(
        <Text key={`h-${i}`} style={{ fontSize: fontSize + 1, lineHeight: lineHeight + 2, fontWeight: '800', color, marginTop: 6 }}>
          {renderSegs(parseInline((h3 ?? h2)![1]), `h-${i}`)}
        </Text>
      );
      return;
    }
    if (trimmed.length === 0) {
      blocks.push(<View key={`sp-${i}`} style={{ height: 6 }} />);
      return;
    }
    blocks.push(
      <Text key={`p-${i}`} style={{ fontSize, lineHeight, color }}>
        {renderSegs(parseInline(line), `p-${i}`)}
      </Text>
    );
  });
  flushList('list-end');

  return <>{blocks}</>;
}
