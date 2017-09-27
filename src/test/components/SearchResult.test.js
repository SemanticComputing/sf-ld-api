import React from 'react';
import { shallow, mount, render } from 'enzyme';

import SearchResult from '../../shared/components/SearchResult';

const props = {
  'title': 'Ammattitoiminnassa tehty rikos',
  'content': '<div class=\"section\"><h4 class=\"item-identifier\">25 §</h4><span class=\"reference reference-amendment\"><a href=\"http://data.finlex.fi/eli/sd/2006/301/alkup\">(28.4.2006/301)</a></span>\n<h4 class=\"heading\">Ammattitoiminnassa tehty rikos</h4>\n<div class=\"subsection\"><p class=\"text-element\">Jos eläinlääkärinammatin harjoittaja on tuomittu vankeusrangaistukseen rikoksesta, jonka hän on tehnyt ammattitoiminnassaan, ja tuomioistuimen tuomio on saanut lainvoiman ja jos rikokseen liittyvistä asianhaaroista on havaittavissa, ettei hän ole sen luottamuksen arvoinen, jota hänen tulee nauttia, Elintarviketurvallisuusvirasto voi poistaa eläinlääkärinammatin harjoittajalta määräajaksi tai, jos asianhaarat ovat erittäin raskauttavat, lopullisesti ammatinharjoittamisoikeuden.</p>\n</div>\n<div class=\"subsection\"><p class=\"text-element\">Jos valtion tai kunnan taikka kuntayhtymän virassa oleva eläinlääkärinammatin harjoittaja on rikoksen johdosta tuomittu erotettavaksi virantoimituksesta tai viralta pantavaksi, noudatetaan vastaavasti, mitä 1 momentissa säädetään.</p>\n</div>\n<div class=\"subsection\"><p class=\"text-element\">Tuomioistuimen tulee viipymättä lähettää jäljennös 1 ja 2 momentissa tarkoitettua asiaa koskevasta pöytäkirjasta ja tuomiosta Elintarviketurvallisuusvirastolle.</p>\n</div>\n<div class=\"subsection\"><p class=\"text-element\">Jo ennen kuin tuomioistuimen tuomio, jolla eläinlääkärinammatin harjoittaja on tuomittu vankeusrangaistukseen taikka viralta pantavaksi tai virantoimituksesta erotettavaksi, on saanut lainvoiman, Elintarviketurvallisuusvirasto voi kieltää eläinlääkärinammatin harjoittajaa harjoittamasta ammattia.</p>\n</div>\n</div>',
  'query': 'rikos',
  'workUrl': 'http://data.finlex.fi/eli/sd/2000/29/luku/5/pykala/25',
  'versionUrl': 'http://data.finlex.fi/eli/sd/2000/29/luku/5/pykala/25/ajantasa/20060501',
  'statuteVersionUrl': 'http://data.finlex.fi/eli/sd/2000/29/ajantasa/20160101',
  'statuteTitle': 'Laki eläinlääkärinammatin harjoittamisesta',
  'type': 'http://data.finlex.fi/schema/sfl/Section'
};

describe('<SearchResult />', () => {
  it('renders the given result', () => {
    const wrapper = shallow(<SearchResult {...props} />);
    expect(wrapper).toMatchSnapshot();
  });
});
