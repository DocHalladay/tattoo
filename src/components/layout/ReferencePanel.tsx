import { useState } from 'react';

const boards = [
  {
    src: '/reference/sleeve-wrap-board.png',
    title: 'Wrap & Placement',
    description: 'Rotation views and element positions around the forearm.',
  },
  {
    src: '/reference/sleeve-story-board.png',
    title: 'Story & Symbolism',
    description: 'Meaning board and phased growth mockup.',
  },
];

export function ReferencePanel() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <>
      <aside className="reference-panel">
        <h2 className="panel-title">Reference</h2>
        {boards.map((board) => (
          <figure
            key={board.src}
            className="reference-card"
            onClick={() => setLightbox(board.src)}
          >
            <img src={board.src} alt={board.title} loading="lazy" />
            <figcaption>{board.title}</figcaption>
            <p>{board.description}</p>
          </figure>
        ))}
      </aside>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)} role="presentation">
          <img src={lightbox} alt="Reference board enlarged" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
