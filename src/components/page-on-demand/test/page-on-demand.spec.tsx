import { newSpecPage } from '@stencil/core/testing';
import { PageOnDemand } from '../page-on-demand';

describe('page-on-demand', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [PageOnDemand],
      html: `<page-on-demand></page-on-demand>`,
    });
    expect(page.root).toEqualHtml(`
      <page-on-demand>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </page-on-demand>
    `);
  });
});
