const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const User = require('./src/models/user');
const Article = require('./src/models/article');
const Comment = require('./src/models/comment');
const View = require('./src/models/view');

const users = [
    { name: 'Stanley Hayford', username: 'sahayford', email: 'hayfordstanley@gmail.com', password: 'password123', profile: 'Writer, thinker, builder. I write about tech, philosophy, and the things nobody talks about.' },
    { name: 'Ama Mensah', username: 'amamensah', email: 'ama@example.com', password: 'password123', profile: 'Exploring the intersection of African culture and modern technology.' },
    { name: 'Kwesi Boateng', username: 'kwesiboat', email: 'kwesi@example.com', password: 'password123', profile: 'Software engineer by day, writer by night. Opinions are my own.' },
    { name: 'Efua Owusu', username: 'efuawrites', email: 'efua@example.com', password: 'password123', profile: 'Journalist covering politics, media, and power. No topic is off limits.' },
    { name: 'Kofi Asante', username: 'kofidev', email: 'kofi@example.com', password: 'password123', profile: 'Full-stack developer and open source advocate. Building tools for the next generation.' },
];

const articles = [
    {
        title: 'The Death of Free Speech on the Internet',
        summary: 'How corporate moderation policies are reshaping what we can say online — and why it matters more than you think.',
        text: `## The Illusion of Openness

When the internet was young, it promised something radical: a place where anyone could speak, publish, and be heard. No gatekeepers. No editors. No approval needed.

That promise is dead.

### What Happened?

Over the past decade, a handful of platforms have become the de facto public square. Facebook, Twitter, YouTube, and Google collectively control what billions of people see, read, and share every day.

\`\`\`
Platforms removed in 2023:
- 4.5 billion pieces of content (Meta)
- 1.2 billion videos (YouTube)
- 500 million tweets (Twitter/X)
\`\`\`

These aren't just companies — they're infrastructure. And when infrastructure decides what speech is acceptable, we have a problem.

### The Moderation Paradox

Here's the uncomfortable truth: **some moderation is necessary**. Nobody wants a feed full of spam, scams, or illegal content. But the line between removing harmful content and suppressing unpopular ideas is thinner than any algorithm can handle.

> "I disapprove of what you say, but I will defend to the death your right to say it." — Evelyn Beatrice Hall

The question isn't whether to moderate. It's **who decides**, and **by what standard**.

### The Real Cost

When platforms over-moderate, several things happen:

1. **Self-censorship increases** — people stop saying what they actually think
2. **Conformity rises** — algorithms reward safe, agreeable content
3. **Trust erodes** — people move to encrypted channels where nothing is accountable
4. **Innovation suffers** — controversial ideas are often the most important ones

### What Can We Do?

- Support platforms that prioritize transparency in moderation
- Push for clear, published content policies
- Build alternatives that don't rely on advertising revenue
- Remember that hearing ideas you disagree with is not the same as being harmed

The internet doesn't need more censorship. It needs more **courage**.

---

*This article represents the author's personal views.*`,
        tags: ['free-speech', 'technology', 'censorship', 'internet'],
        banner: 'https://images.unsplash.com/photo-1504711434969-e33886168d6c?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2024-12-15'),
    },
    {
        title: 'Why Every Developer Should Write',
        summary: 'Writing isn\'t just for journalists. It\'s the most underrated skill in software engineering.',
        text: `## Code Is Not Enough

You can be the best programmer in the world, but if you can't explain what you built — or why — you'll always be limited.

### Writing Is Thinking

The act of writing forces clarity. When you write about a technical decision, you discover gaps in your reasoning. When you document your architecture, you find the edge cases you missed.

\`\`\`javascript
// Bad: code that explains itself
const x = arr.filter(i => i.status === 'active').map(i => i.value);

// Better: code with context
// Filter to active subscriptions and extract their billing amounts
// for the monthly revenue calculation
const activeRevenue = subscriptions
  .filter(sub => sub.status === 'active')
  .map(sub => sub.monthlyAmount);
\`\`\`

### The Career Multiplier

Developers who write well:
- Get promoted faster (they can communicate impact)
- Build better products (they think about the user)
- Lead more effectively (they can align teams with words)
- Create leverage (one blog post can reach thousands)

### How to Start

1. **Write about what you just learned** — if it was new to you, it's new to someone else
2. **Keep it short** — 500 words is better than 5000 unfinished words
3. **Don't aim for perfection** — aim for published
4. **Be specific** — "How I Fixed a Memory Leak in Node.js" beats "JavaScript Tips"

> The best time to start writing was a year ago. The second best time is today.

### The Compound Effect

Every article you write is an asset that works for you while you sleep. It builds your reputation, attracts opportunities, and forces you to learn deeply.

**Stop making excuses. Start writing.**`,
        tags: ['programming', 'writing', 'career', 'software-engineering'],
        banner: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2025-01-20'),
    },
    {
        title: 'The Myth of Meritocracy in Tech',
        summary: 'We love to believe the best ideas win. The reality is far more complicated — and far more human.',
        text: `## "Just Build Something Great"

If you've spent any time in tech, you've heard this advice. The implication is simple: talent rises to the top. The best code wins. The smartest people succeed.

It's a comforting story. It's also largely a myth.

### What Actually Determines Success

Research consistently shows that success in tech (and most fields) depends on:

| Factor | Impact |
|--------|--------|
| Network & connections | Very High |
| Timing & luck | High |
| Communication skills | High |
| Technical ability | Moderate |
| Raw intelligence | Moderate |

This doesn't mean skill doesn't matter. It means **skill alone is not sufficient**.

### The Visibility Problem

Consider two developers:

- **Developer A**: Brilliant coder, works heads-down, ships clean code, never tweets, never speaks at conferences
- **Developer B**: Good coder, writes blog posts, gives talks, maintains an open source project with 500 stars

Who gets the job offer from the hot startup? Who gets invited to speak? Who builds the network that opens doors?

### Why This Matters

If we pretend meritocracy exists, we:
- Blame individuals for systemic problems
- Ignore the role of privilege in access to education, mentorship, and opportunity
- Build hiring processes that reward confidence over competence
- Create cultures where self-promotion is more valued than deep work

### A Better Framework

Instead of meritocracy, we should aim for **equity of opportunity**:

- Evaluate work, not credentials
- Create structured interviews that reduce bias
- Invest in mentorship for underrepresented groups
- Recognize that "culture fit" is often code for "people like us"

The tech industry doesn't need more myth-making. It needs more **honesty**.`,
        tags: ['tech', 'culture', 'meritocracy', 'diversity'],
        banner: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2025-02-10'),
    },
    {
        title: 'Building in Public: A Year of Lessons',
        summary: 'What I learned from sharing my entire development process online — the good, the embarrassing, and the surprisingly useful.',
        text: `## Why I Started

A year ago, I decided to build my next project completely in public. Every commit, every design decision, every failure — shared on social media and my blog.

Here's what happened.

### The Good

**1. Accountability**

When you tell people what you're building, you actually have to build it. There's no quietly abandoning projects when 200 people are watching.

**2. Feedback loops**

Users found bugs I never would have caught. Designers pointed out UX issues I was blind to. Other developers suggested better approaches.

**3. Community**

Building in public attracted other builders. I found collaborators, beta testers, and friends.

### The Bad

**1. Comparison trap**

Seeing other people's progress can be demoralizing. Someone always ships faster, designs better, or gets more attention.

**2. Premature optimization**

When people are watching, you're tempted to make things perfect before they're functional. This is backwards.

**3. Context switching**

Writing updates, responding to comments, and creating content takes real time away from building.

### The Surprising

- **Most people are supportive** — internet toxicity is real but overblown
- **Your failures are more interesting than your successes** — people relate to struggle
- **Documentation happens naturally** — your public updates become your project's history
- **It's a forcing function for good practices** — you write better code when you know someone might read it

### Would I Do It Again?

**Absolutely.** But with boundaries:

- Batch updates instead of real-time sharing
- Focus on decisions and reasoning, not just output
- Don't let the audience dictate the roadmap
- Take breaks from sharing without guilt

Building in public isn't about performance. It's about **connection**.`,
        tags: ['building-in-public', 'startups', 'entrepreneurship', 'learning'],
        banner: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2025-03-01'),
    },
    {
        title: 'Africa Doesn\'t Need Silicon Valley',
        summary: 'The obsession with replicating Western tech ecosystems ignores what makes African innovation unique — and powerful.',
        text: `## Stop Copying, Start Creating

Every few months, a new article declares some African city "the next Silicon Valley." Lagos. Nairobi. Cape Town. Accra.

It's meant as a compliment. It's actually an insult.

### The Problem with the Comparison

Silicon Valley emerged from a specific set of conditions:
- Cold War military funding
- Stanford University's research ecosystem
- A culture of risk tolerance backed by family wealth
- Decades of accumulated venture capital

None of these conditions exist in most of Africa. And **that's fine**.

### What Africa Actually Has

Africa's strengths are different — and in many ways, more interesting:

- **Necessity-driven innovation** — M-Pesa didn't come from a Stanford lab. It came from people who needed to send money without banks.
- **Mobile-first thinking** — African developers never had to "transition" to mobile. They started there.
- **Community-oriented design** — Products built for collective use, not individual consumption
- **Resilience engineering** — Building for unreliable infrastructure creates more robust systems

### Real African Innovation

\`\`\`
M-Pesa: Mobile money before Apple Pay existed
Flutterwave: Pan-African payments infrastructure
Andela: Distributed engineering talent
mPharma: Drug supply chain optimization
Kobo360: Logistics marketplace for a fragmented continent
\`\`\`

None of these are copies of American companies. They solve **African problems** in **African ways**.

### What Needs to Change

1. **Stop measuring African startups by Silicon Valley metrics** — growth rate, valuation multiples, and exit timelines don't map to different economic realities
2. **Fund more local VCs** — the best investors understand the market they serve
3. **Build infrastructure, not just apps** — reliable power, internet, and payment rails enable everything else
4. **Celebrate local exits** — a $10M acquisition that transforms a community matters more than a $1B unicorn that doesn't

Africa doesn't need to be the next Silicon Valley. It needs to be the **first Africa**.`,
        tags: ['africa', 'technology', 'innovation', 'startups'],
        banner: 'https://images.unsplash.com/photo-1489533119213-66a5cd877091?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2025-03-10'),
    },
    {
        title: 'The Case Against Hustle Culture',
        summary: 'Working 80 hours a week isn\'t a badge of honor. It\'s a failure of prioritization.',
        text: `## Glorifying the Grind

Open any social media platform and you'll find it: the hustle gospel.

*"While you were sleeping, I was working."*
*"Sleep is for the weak."*
*"Outwork everyone."*

It sounds motivating. It's actually toxic.

### The Math Doesn't Work

Studies consistently show that productivity **drops sharply** after 50 hours per week. After 55 hours, it drops so much that someone working 70 hours produces nothing more than someone working 55.

> Working more hours doesn't mean getting more done. It means getting less done, slower, with more mistakes.

### What Hustle Culture Actually Produces

- **Burnout** — not the productive kind of tired, the kind where you can't function
- **Bad decisions** — sleep-deprived people make worse choices than drunk people
- **Broken relationships** — nobody on their deathbed wishes they'd sent more emails
- **Health problems** — chronic stress is linked to heart disease, depression, and early death

### The Alternative

The most productive people I know share common habits:

1. **They protect their time ruthlessly** — saying no is a superpower
2. **They rest intentionally** — recovery isn't weakness, it's strategy
3. **They focus on leverage** — one hour of strategic thinking beats ten hours of busy work
4. **They define "enough"** — without a finish line, you'll run forever

### The Real Flex

It's not about how many hours you work. It's about what you produce in the hours you choose to work.

**Rest isn't the reward for work. It's the fuel for it.**`,
        tags: ['productivity', 'mental-health', 'work-life-balance', 'culture'],
        banner: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&h=630&fit=crop',
        published: true,
        datePublished: new Date('2025-03-15'),
    },
];

const seed = async () => {
    try {
        await connectDB();
        console.log('Connected to database');

        // Clear existing data
        await Article.deleteMany({});
        await Comment.deleteMany({});
        await View.deleteMany({});
        console.log('Cleared existing articles, comments, views');

        // Check for existing users or create them
        const createdUsers = [];
        for (const userData of users) {
            let user = await User.findOne({ username: userData.username });
            if (!user) {
                user = await User.create(userData);
                console.log(`Created user: @${user.username}`);
            } else {
                console.log(`User exists: @${user.username}`);
            }
            createdUsers.push(user);
        }

        // Create articles distributed across users
        for (let i = 0; i < articles.length; i++) {
            const author = createdUsers[i % createdUsers.length];
            const article = await Article.create({
                ...articles[i],
                author: author._id,
            });

            // Add some views from other users
            for (let j = 0; j < createdUsers.length; j++) {
                if (j !== i % createdUsers.length) {
                    await View.create({ author: createdUsers[j]._id, article: article._id }).catch(() => {});
                }
            }

            // Add a comment from another user
            const commenter = createdUsers[(i + 1) % createdUsers.length];
            await Comment.create({
                text: 'Great article! This really made me think differently about the topic.',
                author: commenter._id,
                article: article._id,
            });

            console.log(`Created article: "${article.title}" by @${author.username}`);
        }

        console.log(`\nSeed complete: ${createdUsers.length} users, ${articles.length} articles`);
        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error.message);
        process.exit(1);
    }
};

seed();
