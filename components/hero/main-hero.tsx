import { MainCarousel } from "../main-carousel/main-carousel";
import styles from "./main-hero.module.css"

export function MainHero() {
   return (
      <section>
         <MainCarousel className={styles.fadeGradient} />
      </section>
   )
}