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
import { isSectionVisible } from './data/sections'

const show = (key) => isSectionVisible(siteSettings.sections, key)

export default function App() {
  return (
    <>
      <Header />
      <EmergencyNotice notice={siteSettings.notice} />
      <main>
        <Hero />
        {/* プロフィールは常時公開（OWNER ROOMの公開設定の対象外） */}
        <Profile />
        {show('myWorld') && <MyWorld />}
        {show('now') && <Now />}
        {show('works') && <Works />}
        {show('favorites') && <Favorites />}
        {show('randomTakahiro') && <RandomTakahiro />}
        {show('timeline') && <LifeTimeline />}
        {show('gacha') && <MemoryGacha />}
        {show('family') && <FamilyArchive />}
        {show('possibility') && <PersonalHomePossibility />}
        {show('socialLinks') && <SocialLinks />}
      </main>
      <Footer />
    </>
  )
}
