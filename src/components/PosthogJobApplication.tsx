import { ClockIcon, MapPinIcon } from 'lucide-solid'

export function PosthogJobApplication() {
  return (
    <div class="h-full w-screen grid grid-cols-2 overflow-auto">
      <div class="justify-self-center p-4">Content</div>
      <div class="border-l border-muted p-4">
        <Template />
      </div>
    </div>
  )
}

function Template() {
  return (
    <article
      class="reader-view-content-container @container/reader-content-container prose dark:prose-invert prose-a:underline prose-a:font-semibold prose-p:leading-normal prose-li:leading-normal prose-h1:tracking-tight prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-2 prose-h2:tracking-tight prose-h3:tracking-tight prose-img:m-0 prose-sm max-w-none relative"
      style=""
    >
      <div class="@container/reader-content relative p-4 @md/reader-content-container:px-6 @lg/reader-content-container:px-8">
        <h1 class="mx-auto transition-all max-w-full">Product Engineer</h1>
        <div class="reader-content-container">
          <div class="space-y-8">
            <div>
              <p class="m-0 text-secondary pb-2">Multiple teams</p>
              <ul class="list-none m-0 p-0 md:items-center text-black/50 dark:text-white/50 mt-6 flex md:flex-row flex-col md:space-x-12 md:space-y-0 space-y-6">
                <li class="flex space-x-2">
                  <span class="w-6 h-6 text-black dark:text-white flex-shrink-0">
                    <MapPinIcon />
                  </span>
                  <span class="grid">
                    <h4 class="text-sm m-0 font-normal leading-none pt-1">
                      <span>Location</span>
                    </h4>
                    <p class="text-[15px] m-0 mt-1">
                      <strong class="text-black dark:text-white">Remote</strong>
                    </p>
                  </span>
                </li>
                <li class="flex space-x-2">
                  <span class="w-6 h-6 text-black dark:text-white flex-shrink-0">
                    <ClockIcon />
                  </span>
                  <span class="grid">
                    <h4 class="text-sm m-0 font-normal leading-none pt-1">
                      <span>Timezone(s)</span>
                    </h4>
                    <p class="text-[15px] m-0 mt-1">
                      <strong class="text-black dark:text-white">GMT +2 to GMT -8</strong>
                    </p>
                  </span>
                </li>
              </ul>
            </div>
            <div class="grid grid-cols-1 @xl:grid-cols-5 gap-8">
              <div class="@xl:col-span-3" style="">
                <div>
                  <div id="content-section-0">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rf9:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rf8:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-0">
                                About PostHog
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rf9:"
                          role="region"
                          aria-labelledby="radix-:rf8:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 668.90625px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <p>
                              Product development used to mean manually writing code, running analysis, diagnosing bugs,
                              and rolling out changes using dozens of tools.
                            </p>
                            <p>
                              PostHog is the only platform that acts like a co-pilot for you (and your AI agents) to do
                              it all – autonomously.
                            </p>
                            <p>
                              We started with open-source product analytics,
                              <a target="_blank" rel="noopener nofollow" href="https://posthog.com/handbook/story">
                                <u>launched out of Y Combinator's W20 cohort</u>
                              </a>
                              . We've since shipped
                              <a target="_blank" rel="noopener nofollow" href="https://posthog.com/products">
                                <u>more than a dozen products</u>
                              </a>
                              , including:
                            </p>
                            <ul>
                              <li>
                                <p>
                                  <a target="_blank" rel="noopener noreferrer nofollow" href="https://posthog.com/code">
                                    PostHog Code
                                  </a>
                                  , the only AI devtool that understands your product, not just your codebase.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/docs/data-warehouse"
                                  >
                                    <u>A built-in data warehouse</u>
                                  </a>
                                  , so users can query product and customer data together using custom SQL insights.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <a target="_blank" rel="noopener nofollow" href="https://posthog.com/ai">
                                    <u>PostHog AI</u>
                                  </a>
                                  , an AI-powered analyst that answers product questions, helps users find useful
                                  session recordings, and writes custom SQL queries.
                                </p>
                              </li>
                            </ul>
                            <p>We are:</p>
                            <ol>
                              <li>
                                <p>
                                  <strong>Product-led</strong>. More than 450,000 organizations have installed PostHog,
                                  mostly driven by word-of-mouth. We have intensely strong product-market fit.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <a target="_blank" rel="noopener nofollow" href="https://paulgraham.com/aord.html">
                                    <strong>
                                      <u>Default alive</u>
                                    </strong>
                                  </a>
                                  . Revenue is growing incredibly quickly, and we're very efficient. We raise money to
                                  push ambition and grow faster, not to keep the lights on.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Well-funded.</strong> We've raised more than $180m from some of the world's
                                  top investors. We're set up for a long, ambitious journey.
                                </p>
                              </li>
                            </ol>
                            <p>
                              We're focused on building an awesome product for end users, hiring exceptional teammates,
                              shipping fast, and
                              <a target="_blank" rel="noopener nofollow" href="https://posthog.com/deskhog">
                                <u>being as weird as possible</u>
                              </a>
                              .
                            </p>
                            <div
                              style="
                          min-height: 1.2em;
                          margin-top: 0;
                          margin-bottom: 0;
                        "
                            >
                              &nbsp;
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="content-section-1">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rfb:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rfa:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-1">
                                Things we care about
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rfb:"
                          role="region"
                          aria-labelledby="radix-:rfa:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 652.9453125px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <ul>
                              <li>
                                <p>
                                  <strong>Transparency:</strong> Everyone can read about our roadmap, how we pay (or
                                  even let go of) people, our strategy, and how we work, in our
                                  <a target="_blank" rel="noopener nofollow" href="https://posthog.com/handbook">
                                    <u>public company handbook</u>
                                  </a>
                                  . Internally, we share revenue, notes and slides from board meetings, and fundraising
                                  plans, so everyone has the context they need to make good decisions.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Autonomy:</strong> We don’t tell anyone what to do. Everyone chooses what to
                                  work on next based on what's going to have the biggest impact on our customers, and
                                  what they find interesting and motivating to work on.
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/wide-company"
                                  >
                                    <u>Engineers lead product teams</u>
                                  </a>
                                  and
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/which-products"
                                  >
                                    <u>make product decisions</u>
                                  </a>
                                  . Teams are flexible and easy to change when needed.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Shipping fast:</strong>
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/values#why-not-now"
                                  >
                                    <u>Why not now?</u>
                                  </a>
                                  We want to build a lot of products; we can't do that shipping at a normal pace. We've
                                  built the company around small teams – autonomous, highly-efficient groups of
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/founders/cracked-manifesto"
                                  >
                                    <u>cracked engineers</u>
                                  </a>
                                  who can outship much larger companies because they own their products end-to-end.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Time for building:</strong> Nothing gets shipped in a meeting. We're a
                                  natively remote company. We default to async communication – PRs &gt; Issues &gt;
                                  Slack. Tuesdays and Thursdays are
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/company/culture#were-on-the-makers-schedule"
                                  >
                                    <u>meeting-free days</u>
                                  </a>
                                  , and we prioritize heads down building time over perfect coordination. This will be
                                  the most productive job you've ever had.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Ambition:</strong> We want to solve big problems. We strongly believe that
                                  aiming for the best possible upside, and sometimes missing, is better than never
                                  trying. We're optimistic about what's possible and our ability to get there.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Being weird:</strong> Weird means redesigning an already world-class website
                                  for the 5th time. It means shipping
                                  <em>literally</em> every product that relates to customer data. It means building an
                                  <a target="_blank" rel="noopener nofollow" href="https://posthog.com/deskhog">
                                    <u>objectively unnecessary developer toy</u>
                                  </a>
                                  with dubious shareholder value. Doing weird stuff is a competitive advantage. And it's
                                  fun.
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="content-section-2">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rfd:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rfc:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-2">
                                Who we're looking for
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rfd:"
                          role="region"
                          aria-labelledby="radix-:rfc:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 463.9453125px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <p>
                              We're hiring for a range of roles here. What you end up working on will depend on your
                              exact skillset and preferences, so choose your own adventure.
                            </p>
                            <p>In general we seek Product Engineers who are:</p>
                            <ul>
                              <li>
                                <p>
                                  <strong>Enthusiastic drivers.</strong> We need proactive people that can fully own
                                  projects and get them done, and know to get help when needed. This is what being a
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/blog/what-is-a-product-engineer"
                                  >
                                    <u>product engineer</u>
                                  </a>
                                  is all about. "Are we there yet?" is the wrong question.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Optimistic problem solvers.</strong>
                                  Things get hard here sometimes – whether it's scaling, shipping complex products,
                                  handling a stream of support requests, or trying to ship something that touches
                                  multiple teams. We need people who won't get disheartened, and will collaborate,
                                  iterate, and ship their way out of anything.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Grown ups.</strong> We’re an international bunch of weirdos, but one thing
                                  unites us: everyone is kind, considerate, and professional towards each other.
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/company/grown-ups"
                                  >
                                    <u>This isn't about age or experience</u>
                                  </a>
                                  , it's about being low-ego, flexible, and respectful.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Genuine builders.</strong> PostHog is full of people who just love building
                                  stuff, people who would still be building software even if there wasn't a paycheck at
                                  the end. If this sounds like you, we should talk.
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="content-section-3">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rff:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rfe:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-3">
                                What you'll be doing
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rff:"
                          role="region"
                          aria-labelledby="radix-:rfe:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 552.953125px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <ul>
                              <li>
                                <p>
                                  <strong>Owning products and features from beginning to end.</strong>
                                  This means originating ideas based on your intuition, talking to users, and
                                  understanding our strategy and goals. It means testing MVPs in production with real
                                  users. It means
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/engineering/product-engineering"
                                  >
                                    <u>iterating on their feedback</u>
                                  </a>
                                  , owning pricing, and ensuring the ongoing success of your work.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Collaborating with design (when necessary).</strong>
                                  Product engineers at PostHog are full stack, so we expect you to ship and own the
                                  basic UX of your work using
                                  <a target="_blank" rel="noopener nofollow" href="https://storybook.dev.posthog.dev/">
                                    <u>our design system</u>
                                  </a>
                                  <strong>.</strong> From there, it's up to you to decide when to
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/engineering/product-design"
                                  >
                                    <u>collaborate with our design team</u>
                                  </a>
                                  to iterate and polish the experience.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Talking to users.</strong> Good product engineers read feedback from users and
                                  iterate quickly. Great product engineers have users they're friendly with, talk with
                                  them frequently, bounce ideas off them, and iterate with them when they ship new
                                  things.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Doing support.</strong> Every week, one person in each engineering team is
                                  designated the
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/engineering/support-hero"
                                  >
                                    <u>Support hero</u>
                                  </a>
                                  . Their job is to investigate and resolve issues reported by customers for their
                                  product. Giving users support from real engineers, and shipping fixes and improvements
                                  in real-time, is one of the best ways to spark joy in users. This role will also
                                  include some
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/engineering/on-call-rotation"
                                  >
                                    <u>on-call time</u>
                                  </a>
                                  , too.
                                </p>
                              </li>
                              <li>
                                <p>
                                  <strong>Writing docs.</strong> We have a content team that will collaborate with you
                                  on reviewing, polishing, and improving your documentation, but the best person to
                                  document a new feature is the person who built it.
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="content-section-4">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rfh:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rfg:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-4">
                                Requirements
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rfh:"
                          role="region"
                          aria-labelledby="radix-:rfg:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 305.9609375px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <ul>
                              <li>
                                <p>
                                  You've built things agents actually use. More and more of what we ship is used by
                                  agents, not people, and building for them is genuinely different. We want someone
                                  who's done it and has the scars: an API an agent can drive, an MCP server, evals, docs
                                  written for a machine. Side projects count.
                                </p>
                              </li>
                              <li>
                                <p>
                                  Full-stack experience with
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/engineering/stack"
                                  >
                                    <u>relevant technologies</u>
                                  </a>
                                  – e.g. Python or similar, React or similar, something to do with big data is a bonus.
                                </p>
                              </li>
                              <li>
                                <p>
                                  Experience taking a project from 0 to 1. You might have led a project, been a founder
                                  previously, or built an impressive side project.
                                </p>
                              </li>
                              <li>
                                <p>
                                  Strong writing skills.
                                  <a
                                    target="_blank"
                                    rel="noopener nofollow"
                                    href="https://posthog.com/handbook/company/culture#we-write-everything-down"
                                  >
                                    <u>We document everything</u>
                                  </a>
                                  , most of it publicly. The ability to communicate your ideas and make persuasive
                                  arguments is essential.
                                </p>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="content-section-5">
                    <div class="undefined" data-scheme="primary" data-orientation="vertical">
                      <div
                        data-state="open"
                        data-orientation="vertical"
                        class="border-t border-primary first:border-t-0 [&amp;_h3]:my-0 focus-within:relative focus-within:z-10 undefined"
                      >
                        <h3 data-orientation="vertical" data-state="open" class="flex">
                          <button
                            type="button"
                            aria-controls="radix-:rfj:"
                            aria-expanded="true"
                            data-state="open"
                            data-orientation="vertical"
                            id="radix-:rfi:"
                            class="group flex flex-1 items-center justify-between px-2 py-1 text-sm leading-none select-none text-primary outline-none undefined"
                            data-radix-collection-item=""
                          >
                            <span class="flex-1 flex items-center gap-1 text-left">
                              <h3 class="!m-0" id="content-section-5">
                                Nice to have
                              </h3>
                            </span>
                            <svg
                              class="LemonIcon size-6 transition-transform duration-300 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
                              width="100%"
                              fill="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                              viewbox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M7.47 9.47a.75.75 0 0 1 1.06 0L12 12.94l3.47-3.47a.75.75 0 1 1 1.06 1.06l-3.646 3.647a1.25 1.25 0 0 1-1.768 0L7.47 10.53a.75.75 0 0 1 0-1.06Z"
                              ></path>
                            </svg>
                          </button>
                        </h3>
                        <div
                          class="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown p-2 last:rounded-b [&amp;>p:first-child]:mt-0 [&amp;>p:last-child]:mb-0 undefined text-sm"
                          data-state="open"
                          id="radix-:rfj:"
                          role="region"
                          aria-labelledby="radix-:rfi:"
                          data-orientation="vertical"
                          style="
                      --radix-accordion-content-height: var(
                        --radix-collapsible-content-height
                      );
                      --radix-accordion-content-width: var(
                        --radix-collapsible-content-width
                      );
                      transition-duration: 0s;
                      animation-name: none;
                      --radix-collapsible-content-height: 200.9609375px;
                      --radix-collapsible-content-width: 555.3984375px;
                    "
                        >
                          <div>
                            <ul>
                              <li>
                                <p>Have worked at a high-growth SaaS company before.</p>
                              </li>
                              <li>
                                <p>Extensive knowledge of Django and/or TypeScript-based React.</p>
                              </li>
                              <li>
                                <p>Experience building AI-native products, or integrating AI into existing software.</p>
                              </li>
                            </ul>
                            <p>
                              <em>
                                We are committed to ensuring a fair and accessible interview process. If you need any
                                accommodations or adjustments, please let us know
                              </em>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
