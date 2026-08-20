"use client";

import { BookOpen, BrainCircuit, Edit3, HeartHandshake, Rocket, Share2, Sparkles, Users } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCommunity } from "@/components/providers/community-provider";
import { useSession } from "@/components/providers/session-provider";
import { Field, Modal, PageHeader } from "@/components/ui/primitives";
import type { AboutSettings } from "@/lib/types";

const valueIcons = [BrainCircuit, Share2, Rocket, HeartHandshake];
const footerIcons = [Users, BookOpen];

export default function AboutPage() {
  const { data, saveAbout } = useCommunity();
  const { isAdmin } = useSession();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<AboutSettings>(data.about);
  const about = data.about;

  function openEditor() {
    setDraft({
      ...about,
      values: about.values.map((item) => ({ ...item })),
      directions: about.directions.map((item) => ({ ...item })),
      footerCards: about.footerCards.map((item) => ({ ...item })),
    });
    setEditing(true);
  }

  function updateList(
    list: "values" | "directions" | "footerCards",
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [list]: current[list].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  }

  async function saveCopy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await saveAbout(draft)) setEditing(false);
  }

  return (
    <>
      <PageHeader
        eyebrow={about.pageEyebrow}
        title={about.pageTitle}
        description={about.pageDescription}
        action={isAdmin ? <button className="button" type="button" onClick={openEditor}><Edit3 size={16} /> 소개 문구 전체 편집</button> : undefined}
      />
      {isAdmin && <div className="admin-guide"><span><Edit3 size={16} /></span><div><strong>소개 페이지 전체 문구 편집</strong><p>제목, 설명, 핵심 가치, 운영 방식, 장기 목표와 하단 안내 문구를 한 번에 수정할 수 있습니다.</p></div></div>}

      <section className="about-hero">
        <p className="eyebrow">{about.heroEyebrow}</p>
        <h1>{about.heroTitleLine1}<br />{about.heroTitleLine2}</h1>
        <p>{about.heroDescription}</p>
      </section>

      <section className="about-grid" aria-label="핵심 가치">
        {about.values.map((item, index) => {
          const Icon = valueIcons[index] ?? Sparkles;
          return <article className="card value-card" key={item.id}><span className="value-icon"><Icon size={19} /></span><h2>{item.title}</h2><p>{item.description}</p></article>;
        })}
      </section>

      <section className="card direction-card">
        <div className="direction-copy"><p className="eyebrow">{about.directionEyebrow}</p><h2>{about.directionTitleLine1}<br />{about.directionTitleLine2}</h2><p>{about.directionDescription}</p></div>
        <div className="direction-list">{about.directions.map((item, index) => <div className="direction-item" key={item.id}><span className="direction-number">0{index + 1}</span><span><strong>{item.title}</strong><small>{item.description}</small></span></div>)}</div>
      </section>

      <section className="long-term"><span><Sparkles size={24} /></span><div><h2>{about.longTermTitle}</h2><p>{about.longTermDescription}</p></div></section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 18 }}>
        {about.footerCards.map((item, index) => {
          const Icon = footerIcons[index] ?? Sparkles;
          return <div className="card value-card" key={item.id}><span className="value-icon"><Icon size={19} /></span><h2>{item.title}</h2><p>{item.description}</p></div>;
        })}
      </section>

      <Modal open={editing} onClose={() => setEditing(false)} title="동호회 소개 전체 문구 편집" description="각 영역의 문구를 수정하면 소개 페이지에 바로 반영됩니다.">
        <form onSubmit={saveCopy}>
          <fieldset className="editor-group">
            <legend>페이지 상단</legend>
            <Field label="영문 작은 제목"><input required value={draft.pageEyebrow} onChange={(event) => setDraft({ ...draft, pageEyebrow: event.target.value })} /></Field>
            <Field label="페이지 제목"><input required value={draft.pageTitle} onChange={(event) => setDraft({ ...draft, pageTitle: event.target.value })} /></Field>
            <Field label="페이지 설명"><textarea required value={draft.pageDescription} onChange={(event) => setDraft({ ...draft, pageDescription: event.target.value })} /></Field>
          </fieldset>

          <fieldset className="editor-group">
            <legend>메인 소개 배너</legend>
            <Field label="배너 작은 제목"><input required value={draft.heroEyebrow} onChange={(event) => setDraft({ ...draft, heroEyebrow: event.target.value })} /></Field>
            <div className="form-grid"><Field label="배너 제목 첫 줄"><input required value={draft.heroTitleLine1} onChange={(event) => setDraft({ ...draft, heroTitleLine1: event.target.value })} /></Field><Field label="배너 제목 둘째 줄"><input required value={draft.heroTitleLine2} onChange={(event) => setDraft({ ...draft, heroTitleLine2: event.target.value })} /></Field></div>
            <Field label="배너 설명"><textarea required value={draft.heroDescription} onChange={(event) => setDraft({ ...draft, heroDescription: event.target.value })} /></Field>
          </fieldset>

          <fieldset className="editor-group">
            <legend>핵심 가치 4개</legend>
            {draft.values.map((item, index) => <div className="editor-item" key={item.id}><strong>핵심 가치 {index + 1}</strong><Field label="제목"><input required value={item.title} onChange={(event) => updateList("values", index, "title", event.target.value)} /></Field><Field label="설명"><textarea required value={item.description} onChange={(event) => updateList("values", index, "description", event.target.value)} /></Field></div>)}
          </fieldset>

          <fieldset className="editor-group">
            <legend>운영 방식 소개</legend>
            <Field label="영문 작은 제목"><input required value={draft.directionEyebrow} onChange={(event) => setDraft({ ...draft, directionEyebrow: event.target.value })} /></Field>
            <div className="form-grid"><Field label="제목 첫 줄"><input required value={draft.directionTitleLine1} onChange={(event) => setDraft({ ...draft, directionTitleLine1: event.target.value })} /></Field><Field label="제목 둘째 줄"><input required value={draft.directionTitleLine2} onChange={(event) => setDraft({ ...draft, directionTitleLine2: event.target.value })} /></Field></div>
            <Field label="소개 설명"><textarea required value={draft.directionDescription} onChange={(event) => setDraft({ ...draft, directionDescription: event.target.value })} /></Field>
            {draft.directions.map((item, index) => <div className="editor-item" key={item.id}><strong>운영 항목 {index + 1}</strong><Field label="제목"><input required value={item.title} onChange={(event) => updateList("directions", index, "title", event.target.value)} /></Field><Field label="설명"><textarea required value={item.description} onChange={(event) => updateList("directions", index, "description", event.target.value)} /></Field></div>)}
          </fieldset>

          <fieldset className="editor-group">
            <legend>장기 목표</legend>
            <Field label="제목"><input required value={draft.longTermTitle} onChange={(event) => setDraft({ ...draft, longTermTitle: event.target.value })} /></Field>
            <Field label="설명"><textarea required value={draft.longTermDescription} onChange={(event) => setDraft({ ...draft, longTermDescription: event.target.value })} /></Field>
          </fieldset>

          <fieldset className="editor-group">
            <legend>하단 안내 카드</legend>
            {draft.footerCards.map((item, index) => <div className="editor-item" key={item.id}><strong>안내 카드 {index + 1}</strong><Field label="제목"><input required value={item.title} onChange={(event) => updateList("footerCards", index, "title", event.target.value)} /></Field><Field label="설명"><textarea required value={item.description} onChange={(event) => updateList("footerCards", index, "description", event.target.value)} /></Field></div>)}
          </fieldset>

          <div className="form-actions"><button type="button" className="button button-secondary" onClick={() => setEditing(false)}>취소</button><button type="submit" className="button">전체 문구 저장</button></div>
        </form>
      </Modal>
    </>
  );
}
