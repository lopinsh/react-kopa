Gaišajā modē footerim teksts balts

Daudzas bildes salūzušas. Kāpēc?

Grupu skatā, tur kur poga pievienoties, ja jau ir biedrs, tad tajā vietā jārāda neaktīva poga/tags par tagadējo statusu - biedrs, administrators, īpašnieks. (tagad līdzīgi jau strādā, kamēr gaida, ka tiks apstiprināts pieprasījums.) Pogām man izskatās jocīgi, ka ir transparency. Liekas, ka nevajag. Citām grupām tā nav problēma:
http://localhost:3000/lv/wellbeing/group/jurmalas-jogas-kopiena
Šai ir problēma: http://localhost:3000/lv/family/group/origo-brni

Message centrs ir salūzis

Divi search bar, jāizlemj kā rīkoties


Discovery sidebar nāk līdzi citos skatos.

Sadaļā - manas grupas, nevar atšķirt kuras ir manis izveidotas, kurās esmu biedrs, kurās admins, kurās pending.  Nezinu vai vajag kartiņu skatu? Baigi daudz vietas aizņem

Daudzās vietās ir tikai translation string, ne tulkojums. Jāpārskata esošie tulkojumi, lai var pārizmantot, ja vienāda nozīme, ja visam jaunu

Uzspiežot uz profila - dropdown, ir atsevišķs ieraksts profils, bet uz paša lietotāja vārda nevar uzspiest, tas liekas pašsaprotami, un nevajag atsevišķu profile pogu. 

Tur ir sadaļa iestatījumi, kas nekur neved. Tie varētu būt tie, kur ir privacy, vai tevi var redzēt utt. 

Peer-to-peer messaging ir sākts backend, bet nav frontend Messaging.

Vispār visām backend funkcijām/lietām būtu jābūt placeholder frontend elementiem, lai ir skaidrs, ka tas būs, bet vēl nav līdz galam izveidots. 

Man patīk ideja, par tulkotiem slug iebūvētajām lietām. group/grupa tipa sux, ka search engini 2x atrod. Jāpaprasa padoms.

Events tiešās lapas ir jocīgas - jāsalabo, lai sakrīt ar pārējās lapas stilu:
http://localhost:3000/lv/wellbeing/group/jurmalas-jogas-kopiena/events/rita-joga-pie-juras
Pasākumu kreisās puses sadaļa/lapa arī ir salūzusi. Layout sucks. Te var arī ieslēgt horizontālo menu, lai rādītu ... Nākotnes events (uz priekšu), tie uz kuriem ies lietotājs, past events? Vajag?


Dicebear šitie stilīgi avatāri. Var paprasīt ai uzlikt kaut kādu konfigurācijas kontroli. Piemērs
https://api.dicebear.com/9.x/croodles/svg?beardProbability=70&backgroundType=gradientLinear&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&seed=ozols

Group view lapā member bilde neatjaunojas pēc izmaiņām. Tur arī vajadzētu salinkot uz publisko profilu un iekļaut iespēju sazināties.

Izskatās, ka ir slug transliterācijas problēma, un daudzi latviešu burti ar diakritiskajām zīmēm netiek pārveidoti uz parastiem latīņu burtiem. 