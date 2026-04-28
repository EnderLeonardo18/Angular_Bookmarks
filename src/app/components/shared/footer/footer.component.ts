import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(){}

  currentYear: number = new Date().getFullYear();

  // readonly ya que no se va a cambiar
  readonly gitHubUsername: string = 'https://github.com/EnderLeonardo18'

}
