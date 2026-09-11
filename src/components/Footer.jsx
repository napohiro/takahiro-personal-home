import useReveal from '../hooks/useReveal'
import PersonalCTA from './PersonalCTA'

export default function Footer() {
  const [ref, visible] = useReveal()

  return (
    <footer ref={ref} className={`footer reveal ${visible ? 'is-visible' : ''}`}>
      <div className="container">
        <h2 className="footer__title">THANKS FOR VISITING MY WORLD.</h2>
        <p className="footer__sub">人生はまだ制作途中。また何か増えているかもしれません。</p>

        <div className="footer__totop">
          <a href="#top" className="btn btn--ghost">
            BACK TO TOP
          </a>
        </div>

        <PersonalCTA />

        <p className="footer__copyright">© TAKAHIRO — PERSONAL HOME</p>
        <a href="/owner-room" className="footer__owner-link">
          OWNER ROOM
        </a>
      </div>
    </footer>
  )
}
