import Link from 'next/link';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, Text } from '@/components/ui';

function BreadPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5c0-3.038 3.582-5.5 8-5.5s8 2.462 8 5.5c0 .552-.336 1-.9 1.12C17.86 11.86 15.06 12 12 12s-5.86-.14-7.1-.38c-.564-.12-.9-.568-.9-1.12z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 11.5 4 17a2 2 0 0 0 2 2.2h12A2 2 0 0 0 20 17l-.5-5.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12v-1.5M15 12v-1.5" />
    </svg>
  );
}

const storyParagraphs = [
  'Hi! I’m Izamary, the baker behind Izy’s Sourdough.',
  'My baking journey began during my pregnancy with my second child, when life suddenly slowed down — a lot. I went from working full time and going to school to having more quiet time at home than I had in a very long time. I needed something creative to pour myself into, and with a lot of encouragement from my husband, I started baking.',
  'At first, it was simple yeast breads and easy no-knead loaves. But little by little, I started branching out into different types of breads like burger buns, bagels, and more.',
  'One evening, my husband and I started watching Crime Scene Kitchen, and seeing all of the beautiful pastries and desserts inspired me to challenge myself even more. That’s when I really grew to love the process of baking.',
  'So where does sourdough fit into all of this?',
  'Honestly, sourdough was always something I wanted to try, but it felt intimidating. After learning more advanced baking techniques — from laminated doughs for croissants and Danish pastries to layered cakes — I finally thought, “Maybe I can actually do this.”',
  'And once again, with the full support of my husband, the sourdough journey began.',
  'After months of trial and error, I finally created my very first healthy starter in October 2024. I haven’t looked back since.',
  'Now, almost everything I bake is sourdough, or has sourdough in it.',
  'What I love most is creating bread that feels both comforting and beautiful. Every loaf is handmade with patience, creativity, and care — almost like edible art.',
  'If you buy bread from me, I hope you can taste the journey, the love, and the care in every bite.',
];

const philosophyItems = [
  {
    title: 'Small-batch baking',
    description: 'Every bake is intentionally planned in limited quantities so each loaf receives attention and care.',
  },
  {
    title: 'Slow fermentation',
    description: 'The process is never rushed, giving each loaf time to develop flavor, texture, and character.',
  },
  {
    title: 'Simple ingredients',
    description: 'Flour, water, salt, and starter form the foundation for bread that feels honest and nourishing.',
  },
  {
    title: 'Fresh weekly rhythm',
    description: 'Bread is baked fresh on pickup morning so customers receive it at its best.',
  },
];

const heroClasses = 'flex max-w-3xl flex-col items-start gap-4';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const heroTextClasses = 'max-w-2xl text-body font-medium text-primary/90';
const editorialGridClasses = 'grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12';
const sectionIntroClasses = 'flex max-w-xl flex-col gap-3';
const centeredIntroClasses = 'mx-auto flex max-w-xl flex-col items-center gap-3 text-center';
const storyCardClasses = 'rounded-lg border border-surfaceBorder bg-background p-6 shadow-card sm:p-8';
const storyBodyClasses = 'grid gap-5';
const storyTextClasses = 'text-primary/90';
const storyImageClasses =
  'mt-4 flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg bg-accent/20 text-primary/40';
const philosophyGridClasses = 'mt-10 grid gap-8 sm:grid-cols-2';
const philosophyCardClasses = 'flex flex-col gap-3';
const cardTextClasses = 'text-primary/90';
const communityClasses = 'mx-auto flex max-w-3xl flex-col items-center text-center';
const sectionDividerClasses = 'mx-auto mb-8 w-16 border-surfaceBorder md:w-24';
const communityListClasses = 'mt-6 flex flex-wrap justify-center gap-3';
const communityItemClasses = 'font-body text-small font-medium text-primary';
const ctaClasses = 'rounded-lg p-6 text-center sm:p-8';
const ctaContentClasses = 'mx-auto flex max-w-2xl flex-col items-center gap-4';

export default function AboutPage() {
  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="about-heading">
        <div className={heroClasses}>
          <p className={eyebrowClasses}>About the Bakery</p>
          <Heading id="about-heading" level={1}>
            Small-Batch Sourdough, Made with Care
          </Heading>
          <Text className={heroTextClasses}>
            Izy’s Sourdough is a local in-home artisan bakery focused on handcrafted bread, thoughtful fermentation, and creating something warm for the community to gather around.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="lg" aria-labelledby="story-heading">
        <div className={editorialGridClasses}>
          <div className={sectionIntroClasses}>
            <p className={eyebrowClasses}>Our story</p>
            <Heading id="story-heading" level={2}>
              From a quiet season at home to a sourdough rhythm
            </Heading>
            <Text className="text-primary/90">
              A personal baking journey shaped by family, patience, and a growing love for handmade bread.
            </Text>
            <div className={storyImageClasses}>
              <BreadPlaceholderIcon className="h-10 w-10" />
              <span className="font-body text-small font-medium uppercase tracking-[0.14em]">
                Photo coming soon
              </span>
            </div>
          </div>
          <article className={storyCardClasses}>
            <div className={storyBodyClasses}>
              {storyParagraphs.map((paragraph) => (
                <Text key={paragraph} className={storyTextClasses}>
                  {paragraph}
                </Text>
              ))}
            </div>
          </article>
        </div>
      </SectionContainer>

      <SectionContainer spacing="lg" aria-labelledby="philosophy-heading">
        <div className={centeredIntroClasses}>
          <p className={eyebrowClasses}>Baking philosophy</p>
          <Heading id="philosophy-heading" level={2}>
            Simple bread, made slowly and intentionally
          </Heading>
          <Text className="text-primary/90">
            Each loaf follows a calm weekly rhythm built around flavor, freshness, and a hands-on process.
          </Text>
        </div>
        <div className={philosophyGridClasses}>
          {philosophyItems.map((item) => (
            <article key={item.title} className={philosophyCardClasses}>
              <Heading level={3}>{item.title}</Heading>
              <Text size="small" className={cardTextClasses}>
                {item.description}
              </Text>
            </article>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer spacing="lg" aria-labelledby="community-heading">
        <section className={communityClasses}>
          <hr className={sectionDividerClasses} />
          <div className={sectionIntroClasses}>
            <p className={eyebrowClasses}>Local community</p>
            <Heading id="community-heading" level={2}>
              Baked locally for nearby families
            </Heading>
            <Text className="text-primary/90">
              Izy’s Sourdough is rooted in local pickup and community connection, serving neighbors around Zephyrhills, Wesley Chapel, Dade City, and New Tampa with handmade food made close to home.
            </Text>
          </div>
          <ul className={communityListClasses}>
            {['Zephyrhills', 'Wesley Chapel', 'Dade City', 'New Tampa'].map((area) => (
              <li key={area} className={communityItemClasses}>
                {area}
              </li>
            ))}
          </ul>
        </section>
      </SectionContainer>

      <SectionContainer spacing="lg" aria-labelledby="about-cta-heading">
        <aside className={ctaClasses}>
          <hr className={sectionDividerClasses} />
          <div className={ctaContentClasses}>
            <p className={eyebrowClasses}>Fresh every week</p>
            <Heading id="about-cta-heading" level={2}>
              Ready to choose your loaf?
            </Heading>
            <Text className="text-primary/90">
              Browse the weekly menu and reserve handcrafted sourdough for Wednesday pickup.
            </Text>
            <Link href="/menu">
              <Button>View This Week’s Menu</Button>
            </Link>
          </div>
        </aside>
      </SectionContainer>
    </PageContainer>
  );
}
