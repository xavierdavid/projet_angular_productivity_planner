import { Component, signal } from '@angular/core';
import { HomeBannerDumbComponent } from './home-banner/home-banner.dumb.component';
import { HomepageFeatureCardListDumbComponent } from './homepage-feature-card-list/homepage-feature-card-list.dumb.component';

@Component({
  imports: [HomeBannerDumbComponent, HomepageFeatureCardListDumbComponent],
  templateUrl: './home.page.component.html',
  styleUrl: './home.page.component.scss'
})
export class HomePageComponent {
  featureCardList = signal([
    {
      name: 'Planifier sa semaine',
      icon: 'calendar',
      description: 'Visibilité sur les 7 prochains jours'
    },
    {
      name: 'Atteindre ses objectifs',
      icon: 'Description 2',
      description: 'Priorisation des tâches'
    },
    {
      name: 'Analyser sa productivité',
      icon: 'Description 3r',
      description: 'Visualiser le travail accompli'
    }
  ]);  
  
  onBannerClicked() {
    console.log('Banner clicked');
  }
}
