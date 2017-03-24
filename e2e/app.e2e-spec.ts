import { LimsFrontendPage } from './app.po';

describe('lims-frontend App', function() {
  let page: LimsFrontendPage;

  beforeEach(() => {
    page = new LimsFrontendPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
