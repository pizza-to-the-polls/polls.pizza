import { newE2EPage } from '@stencil/core/testing';

describe('page-covid', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-covid></page-covid>');

    const element = await page.find('page-covid');
    expect(element).toHaveClass('hydrated');
  });
});
