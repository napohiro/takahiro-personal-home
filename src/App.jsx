import Header from './components/Header'
import Hero from './components/Hero'
import Profile from './components/Profile'
import MyWorld from './components/MyWorld'
import Now from './components/Now'
import Works from './components/Works'
import Favorites from './components/Favorites'
import RandomTakahiro from './components/RandomTakahiro'
import LifeTimeline from './components/LifeTimeline'
import SocialLinks from './components/SocialLinks'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Profile />
        <MyWorld />
        <Now />
        <Works />
        <Favorites />
        <RandomTakahiro />
        <LifeTimeline />
        <SocialLinks />
      </main>
      <Footer />
    </>
  )
}
