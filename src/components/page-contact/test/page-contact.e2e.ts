import { newE2EPage } from '@stencil/core/testing';

describe('page-contact', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<page-contact></page-contact>');

    const element = await page.find('page-contact');
    expect(element).toHaveClass('hydrated');
  });
});
