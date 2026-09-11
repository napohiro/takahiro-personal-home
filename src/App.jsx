import Header from './components/Header'
import Hero from './components/Hero'
import Profile from './components/Profile'
import MyWorld from './components/MyWorld'
import Now from './components/Now'
import Works from './components/Works'
import Favorites from './components/Favorites'
import RandomTakahiro from './components/RandomTakahiro'
import LifeTimeline from './components/LifeTimeline'
import MemoryGacha from './components/MemoryGacha'
import FamilyArchive from './components/FamilyArchive'
import PersonalHomePossibility from './components/PersonalHomePossibility'
import SocialLinks from './components/SocialLinks'
import Footer from './components/Footer'
import EmergencyNotice from './components/EmergencyNotice'
import siteSettings from './data/siteSettings.json'

const { sections } = siteSettings

export default function App() {
  return (
    <>
      <Header />
      <EmergencyNotice notice={siteSettings.notice} />
      <main>
        <Hero />
        {sections.profile && <Profile />}
        {sections.myWorld && <MyWorld />}
        {sections.now && <Now />}
        {sections.works && <Works />}
        {sections.favorites && <Favorites />}
        <RandomTakahiro />
        {sections.timeline && <LifeTimeline />}
        {sections.gacha && <MemoryGacha />}
        {sections.family && <FamilyArchive />}
        <PersonalHomePossibility />
        {sections.socialLinks && <SocialLinks />}
      </main>
      <Footer />
    </>
  )
}
