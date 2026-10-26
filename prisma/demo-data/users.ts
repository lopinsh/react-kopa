import type { DemoUser } from './types';

const bio = (line: string) => `Iedomāts demo dalībnieks. ${line}`;

/** 15 imaginary members. Email is built by the script as <username>@demo.ejam.invalid. */
export const DEMO_USERS: DemoUser[] = [
  { key: 'demo_zvaigznu_marite', name: 'Zvaigžņu Mārīte', username: 'demo_zvaigznu_marite', bio: bio('Skaita zvaigznes un uzvar viktorīnās.'), cities: ['Riga'] },
  { key: 'demo_kapteinis_mencis', name: 'Kapteinis Mencis', username: 'demo_kapteinis_mencis', bio: bio('Stūrē visu, kas peld.'), cities: ['Liepaja', 'Riga'] },
  { key: 'demo_migla_ruta', name: 'Miglas Rūta', username: 'demo_migla_ruta', bio: bio('Agri ceļas un vēlu ārdās.'), cities: ['Cesis'] },
  { key: 'demo_dzirkstele_janis', name: 'Dzirksteļu Jānis', username: 'demo_dzirkstele_janis', bio: bio('Salodē visu, kas kūp.'), cities: ['Riga', 'Sigulda'] },
  { key: 'demo_lapsu_anna', name: 'Lapsu Anna', username: 'demo_lapsu_anna', bio: bio('Dārza pundurus uzskata par kolēģiem.'), cities: ['Valmiera'] },
  { key: 'demo_ledus_toms', name: 'Ledus Toms', username: 'demo_ledus_toms', bio: bio('Mēneša pirmā nedēļa viņam ir ziema.'), cities: ['Daugavpils'] },
  { key: 'demo_pelekais_olivers', name: 'Pelēkais Olivers', username: 'demo_pelekais_olivers', bio: bio('Runā maz, bet precīzi.'), cities: ['Riga'] },
  { key: 'demo_saules_ilze', name: 'Saules Ilze', username: 'demo_saules_ilze', bio: bio('Ņem līdzi sviestmaizes visiem.'), cities: ['Jurmala', 'Riga'] },
  { key: 'demo_vetras_edgars', name: 'Vētras Edgars', username: 'demo_vetras_edgars', bio: bio('Vienmēr uz pareizā viļņa.'), cities: ['Liepaja'] },
  { key: 'demo_sniega_liene', name: 'Sniega Liene', username: 'demo_sniega_liene', bio: bio('Sasalst pēdējā, atkūst pirmā.'), cities: ['Sigulda', 'Cesis'] },
  { key: 'demo_rozes_arturs', name: 'Rožu Arturs', username: 'demo_rozes_arturs', bio: bio('Zina visus stāstus, arī neesošos.'), cities: ['Riga'] },
  { key: 'demo_mezu_dace', name: 'Mežu Dace', username: 'demo_mezu_dace', bio: bio('Sēņo ar kompasu un bez plāna.'), cities: ['Valmiera', 'Cesis'] },
  { key: 'demo_tintes_karlis', name: 'Tintes Kārlis', username: 'demo_tintes_karlis', bio: bio('Raksta uz visa, kas turas mierā.'), cities: ['Riga', 'Jurmala'] },
  { key: 'demo_zeltainais_gatis', name: 'Zeltainais Gatis', username: 'demo_zeltainais_gatis', bio: bio('Svilpo, kad domā.'), cities: ['Daugavpils', 'Riga'] },
  { key: 'demo_burbulu_santa', name: 'Burbuļu Santa', username: 'demo_burbulu_santa', bio: bio('Peldas visos laikapstākļos.'), cities: ['Jurmala'] },
];
