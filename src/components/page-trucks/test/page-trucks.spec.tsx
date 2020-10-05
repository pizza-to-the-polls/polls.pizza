import { newSpecPage } from '@stencil/core/testing';
import { PageTrucks } from '../page-trucks';

describe('page-trucks', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PageTrucks],
      html: `<page-trucks></page-trucks>`,
    });
    expect(page.root).toEqualHtml(`
      <page-trucks>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-trucks>
    `);
  });
});
