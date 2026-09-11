export default function EmergencyNotice({ notice }) {
  if (!notice?.enabled) return null
  if (!notice.title && !notice.message) return null

  return (
    <div className="emergency-notice" role="status">
      <div className="container emergency-notice__inner">
        {notice.title && <strong className="emergency-notice__title">{notice.title}</strong>}
        {notice.message && <p className="emergency-notice__message">{notice.message}</p>}
      </div>
    </div>
  )
}
