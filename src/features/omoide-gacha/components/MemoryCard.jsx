export default function MemoryCard({ memory, onSpinAgain }) {
  if (!memory) return null;

  return (
    <div className="og-memory-overlay">
      <div className="og-memory-overlay-glow" />
      <div className="og-polaroid">
        <div className="og-polaroid-photo">
          <img src={memory.imageUrl} alt="" draggable={false} />
        </div>
        {memory.comment && <p className="og-polaroid-comment">{memory.comment}</p>}
        <div className="og-polaroid-footer">
          <span className="og-polaroid-date">{memory.date}</span>
          {memory.tag && <span className="og-polaroid-tag">{memory.tag}</span>}
        </div>
      </div>

      <button type="button" className="og-spin-again" onClick={onSpinAgain}>
        もう一度まわす
      </button>
    </div>
  );
}
