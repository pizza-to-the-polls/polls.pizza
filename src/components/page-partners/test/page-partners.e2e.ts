import { newE2EPage } from '@stencil/core/testing';

describe('page-partners', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-partners></page-partners>');

    const element = await page.find('page-partners');
    expect(element).toHaveClass('hydrated');
  });
});
