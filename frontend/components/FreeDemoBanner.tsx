'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { FREE_DEMO } from '@/lib/freeDemo';

export default function FreeDemoBanner() {
  const { locale } = useLanguage();
  if (!FREE_DEMO) return null;
  return (
    <div className="alert alert-info small" style={{ marginBottom: 16 }} data-no-translate>
      {locale === 'zh' ? <>
        <strong>免费演示模式：</strong>可浏览演示邮件、原文和附件文本；AI 分析与批量运行已关闭。这里没有接入你自己训练的分类模型。
        后端休眠后首次打开可能需要等待约一分钟，再刷新页面。<Link href="/inbox">打开收件箱 →</Link>
      </> : <>
        <strong>Free demo:</strong> browse demo emails, original messages and attachment text. AI analysis and batch runs are disabled. No self-trained classifier is connected here.
        The free backend may need about a minute to wake up; then refresh. <Link href="/inbox">Open inbox →</Link>
      </>}
    </div>
  );
}
