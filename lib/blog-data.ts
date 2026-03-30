export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
  featured: boolean;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  tags: string[];
  status: "published" | "draft" | "scheduled";
}

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "witnessing-the-great-migration",
    title: "Witnessing the Great Migration: A Once-in-a-Lifetime Experience",
    excerpt: "Every year, over two million wildebeest, zebras, and gazelles traverse the Serengeti-Mara ecosystem in search of greener pastures. Here's what it's like to witness this natural wonder.",
    content: `
## The Greatest Show on Earth

Every year, between July and October, the Masai Mara becomes the stage for one of nature's most spectacular events - the Great Migration. Over two million wildebeest, accompanied by hundreds of thousands of zebras and gazelles, make their way from the Serengeti plains of Tanzania into Kenya's Masai Mara in search of fresh grazing lands.

### The River Crossings

Perhaps the most dramatic moments of the migration occur at the Mara River. Here, the herds must brave crocodile-infested waters and steep riverbanks to continue their journey. The tension is palpable as thousands of animals gather on the riverbank, waiting for one brave individual to take the plunge.

From our vantage point at Enchipai Camp, located on the Esoit Oloololo escarpment, guests have witnessed these crossings unfold like scenes from a nature documentary. The sounds alone - the thundering hooves, the splashing water, the calls of the wildebeest - create an unforgettable symphony of the wild.

### Best Viewing Times

The migration typically reaches the Mara between July and October, with peak activity often occurring in August and September. However, the exact timing can vary depending on rainfall patterns in both Tanzania and Kenya.

**Pro tip:** Early morning game drives offer the best lighting for photography and wildlife is most active during the cooler hours.

### What to Expect at Enchipai

At Enchipai Camp, we position our guests for optimal migration viewing:

- **Daily game drives** following the herds
- **Expert Maasai guides** who know the migration patterns
- **Sundowner experiences** overlooking the plains
- **Night drives** to witness nocturnal predator activity

The Great Migration is not just about the wildebeest - it's an entire ecosystem on the move. Lions follow the herds, knowing that the river crossings provide easy prey. Vultures circle overhead, while crocodiles position themselves in the shallows.

### Conservation Matters

The migration is a delicate phenomenon that depends on the preservation of both the Serengeti and Mara ecosystems. At Enchipai, we're committed to sustainable tourism practices that help protect this natural wonder for future generations.

*Come witness the greatest show on earth. Book your migration safari with Enchipai Camp today.*
    `,
    image: "/images/blog-migration.jpg",
    category: "wildlife",
    date: "January 15, 2026",
    readTime: "8 min read",
    featured: true,
    author: {
      name: "James Oloitiptip",
      role: "Head Safari Guide",
      avatar: "/images/wildlife.jpg"
    },
    tags: ["Migration", "Wildlife", "Safari Tips", "Photography"],
    status: "published"
  },
  {
    id: 2,
    slug: "elusive-leopard-tracking",
    title: "The Elusive Leopard: Tracking the Mara's Most Secretive Cat",
    excerpt: "Leopards are masters of stealth and camouflage. Our guide shares tips on how to spot these magnificent cats during your safari.",
    content: `
## Masters of Stealth

Of all the big cats in Africa, the leopard is arguably the most difficult to spot. These solitary hunters are masters of camouflage, using their spotted coats to blend seamlessly into the dappled light of the African bush.

### Where to Look

Unlike lions, which often rest in open areas, leopards prefer the cover of trees, rocky outcrops, and dense vegetation. Here are some prime leopard spotting locations in the Mara:

1. **Acacia trees** - Leopards often drag their kills into trees to keep them safe from scavengers
2. **Riverine forests** - The dense vegetation along rivers provides perfect cover
3. **Rocky kopjes** - These granite outcrops offer elevated resting spots
4. **Tall grass areas** - During the dry season, leopards use remaining green areas as ambush points

### Signs to Watch For

Our guides have spent years learning to read the signs of leopard presence:

- **Alarm calls** from baboons and vervet monkeys
- **Scratch marks** on tree trunks
- **Drag marks** in the sand
- **Impala behavior** - they become extremely alert when a leopard is near

### The Leopards of Oloololo

The Esoit Oloololo escarpment, where Enchipai Camp is located, is known for its healthy leopard population. The rocky terrain and abundant tree cover provide ideal habitat for these secretive cats.

Several individual leopards have become well-known to our guides, including a beautiful female we call "Shadow" who often hunts near the camp.

### Photography Tips

Photographing leopards requires patience and preparation:

- Use a fast lens (f/2.8 or faster) for low-light conditions
- Keep your camera ready at all times
- Be patient - leopard sightings can be brief
- Respect their space - stressed animals won't behave naturally

*Join us at Enchipai for a chance to encounter these magnificent cats in their natural habitat.*
    `,
    image: "/images/blog-leopard.jpg",
    category: "wildlife",
    date: "January 8, 2026",
    readTime: "6 min read",
    featured: false,
    author: {
      name: "James Oloitiptip",
      role: "Head Safari Guide",
      avatar: "/images/wildlife.jpg"
    },
    tags: ["Leopards", "Big Cats", "Wildlife Photography", "Safari Tips"],
    status: "published"
  },
  {
    id: 3,
    slug: "embracing-maasai-culture",
    title: "Embracing Maasai Culture: Traditions That Endure",
    excerpt: "The Maasai people have lived in harmony with wildlife for centuries. Learn about their rich traditions, customs, and way of life.",
    content: `
## Guardians of the Mara

For centuries, the Maasai people have called the savannahs of Kenya and Tanzania their home. Their semi-nomadic lifestyle, distinctive dress, and deep connection to the land make them one of Africa's most iconic communities.

### A Living Culture

The Maasai have maintained their traditional way of life despite the pressures of modernization. Their culture is built around cattle herding, which forms the foundation of their economy, social structure, and spiritual beliefs.

**Key aspects of Maasai culture include:**

- **Age-set system** - Society is organized by age groups, with each set having specific roles and responsibilities
- **Cattle as wealth** - Cows are central to Maasai life, used for food, trade, and dowries
- **Oral traditions** - Stories, songs, and history are passed down through generations
- **Distinctive dress** - The famous red shuka (cloth) and beaded jewelry

### Warriors and Elders

The Maasai are famous for their warrior tradition. Young men undergo rigorous training and initiation ceremonies to become morans (warriors). These warriors were traditionally responsible for protecting the community and their livestock from predators.

The jumping dance (adumu) is perhaps the most recognizable Maasai tradition, where warriors compete to jump the highest while maintaining perfect posture.

### Coexistence with Wildlife

The Maasai have a unique relationship with the wildlife of the Mara. Traditionally, they did not hunt wild animals for food, allowing them to coexist with the great herds that roam their lands.

This relationship has been crucial for conservation. Many of our guides at Enchipai are Maasai, and their knowledge of the land and its animals is unparalleled.

### Cultural Experiences at Enchipai

We offer our guests authentic cultural experiences:

- **Village visits** to learn about daily Maasai life
- **Traditional dancing** and singing demonstrations
- **Beadwork workshops** with Maasai women
- **Stories around the campfire** with Maasai elders
- **Walking safaris** guided by Maasai warriors

*Experience the warmth of Maasai hospitality at Enchipai Camp.*
    `,
    image: "/images/blog-maasai.jpg",
    category: "culture",
    date: "December 28, 2025",
    readTime: "10 min read",
    featured: false,
    author: {
      name: "Sarah Kimani",
      role: "Cultural Liaison",
      avatar: "/images/dining.jpg"
    },
    tags: ["Maasai", "Culture", "Traditions", "Kenya"],
    status: "published"
  },
  {
    id: 4,
    slug: "best-time-to-visit-masai-mara",
    title: "Best Time to Visit the Masai Mara: A Complete Guide",
    excerpt: "Planning your safari? We break down the seasons, weather patterns, and wildlife activity throughout the year.",
    content: `
## Year-Round Safari Destination

The Masai Mara offers incredible wildlife viewing throughout the year, but each season brings its own unique experiences. Here's our comprehensive guide to help you plan your perfect safari.

### High Season: July - October

This is peak migration season and the most popular time to visit.

**Pros:**
- Witness the Great Migration
- Dramatic river crossings
- Excellent predator activity
- Clear skies and minimal rain

**Cons:**
- Higher prices
- More tourists
- Need to book well in advance

### Green Season: November - May

Often overlooked, this season offers its own rewards.

**November - December:**
- Short rains bring lush landscapes
- Newborn animals everywhere
- Excellent bird watching
- Fewer tourists

**January - March:**
- Dry and warm
- Predator hunts are easier to spot
- Great visibility
- Lower rates

**April - May:**
- Long rains
- Dramatic skies for photography
- Lowest prices
- Some camps close

### Month-by-Month Guide

| Month | Weather | Wildlife Highlights |
|-------|---------|-------------------|
| Jan-Feb | Dry, hot | Predators, calving in Serengeti |
| Mar-May | Wet | Birds, new grass, babies |
| Jun | Dry starts | Migration approaches |
| Jul-Oct | Dry | Migration, river crossings |
| Nov-Dec | Short rains | Newborns, birds |

### Our Recommendation

For a balanced experience, we suggest visiting in **June or early July** before the peak crowds arrive, or in **November** when the rains bring new life to the Mara.

*Whatever time you choose, the Mara never disappoints. Contact us to plan your safari.*
    `,
    image: "/images/blog-sunrise.jpg",
    category: "tips",
    date: "December 20, 2025",
    readTime: "7 min read",
    featured: false,
    author: {
      name: "David Njogu",
      role: "Camp Manager",
      avatar: "/images/luxury-tent.jpg"
    },
    tags: ["Travel Planning", "Seasons", "Weather", "Safari Tips"],
    status: "published"
  },
  {
    id: 5,
    slug: "big-five-safari-guide",
    title: "The Big Five: Where to Find Africa's Most Iconic Animals",
    excerpt: "Lions, leopards, elephants, rhinos, and buffalo - discover the best spots and times to encounter these legendary creatures.",
    content: `
## The Legendary Big Five

The term "Big Five" was originally coined by big-game hunters to describe the five most difficult and dangerous animals to hunt on foot. Today, these magnificent creatures are the stars of any African safari.

### Lion (Simba)

**Where to find them:** Open grasslands and areas near water sources

The Masai Mara is home to numerous lion prides. The most reliable sightings are:
- Early morning when they're returning from night hunts
- Near wildebeest herds during migration
- Resting in shade during midday

**At Enchipai:** Our location near the Mara Triangle offers excellent lion viewing, with several prides resident in the area.

### Leopard (Chui)

**Where to find them:** Dense bush, riverine forests, rocky outcrops

The most elusive of the Big Five, leopards require patience and expert guides.
- Look for alarm calls from baboons and impalas
- Check acacia trees where they often rest
- Best spotted during early morning or late afternoon

### Elephant (Tembo)

**Where to find them:** Throughout the Mara, often near water

The Mara's elephant population moves freely between Kenya and Tanzania.
- Large herds often near the Mara River
- Bulls frequently seen in wooded areas
- Active throughout the day

### Rhino (Kifaru)

**Where to find them:** Protected areas within the conservancies

Black rhinos are critically endangered, making sightings special.
- Best seen early morning
- Often in open areas with good visibility
- Guards protect key rhino areas

### Buffalo (Nyati)

**Where to find them:** Open grasslands, near water

Often underappreciated, buffalo are among Africa's most dangerous animals.
- Large herds in the central plains
- Old bulls often solitary near water
- Active morning and evening

### Your Big Five Checklist

At Enchipai, our experienced guides work tirelessly to help you complete your Big Five sightings. Most guests achieve this within a 3-4 day safari.

*Book your Big Five safari adventure with us today.*
    `,
    image: "/images/blog-bigfive.jpg",
    category: "wildlife",
    date: "December 12, 2025",
    readTime: "9 min read",
    featured: false,
    author: {
      name: "James Oloitiptip",
      role: "Head Safari Guide",
      avatar: "/images/wildlife.jpg"
    },
    tags: ["Big Five", "Wildlife", "Safari", "Photography"],
    status: "published"
  },
  {
    id: 6,
    slug: "conservation-efforts-mara",
    title: "Conservation Efforts in the Mara: Protecting Our Wildlife",
    excerpt: "Learn about the ongoing conservation initiatives that ensure the Masai Mara remains a sanctuary for generations to come.",
    content: `
## Protecting Paradise

The Masai Mara is one of Earth's last great wilderness areas, but it faces mounting pressures from human population growth, climate change, and poaching. Here's how conservation efforts are working to protect this precious ecosystem.

### The Conservancy Model

The area surrounding the Masai Mara National Reserve is protected by a network of community conservancies. This innovative model provides:

- **Income for local communities** through tourism
- **Wildlife corridors** connecting protected areas
- **Reduced human-wildlife conflict**
- **Sustainable land use practices**

Enchipai Camp operates within this conservancy system, ensuring that tourism directly benefits conservation and local communities.

### Anti-Poaching Initiatives

Despite international bans, poaching remains a threat, particularly for elephants and rhinos. Conservation efforts include:

- **24/7 ranger patrols**
- **Aerial surveillance**
- **Community intelligence networks**
- **Rapid response units**

### Predator Protection

Large carnivores face threats from habitat loss and conflict with livestock owners. Programs include:

- **Lion monitoring** with GPS collars
- **Predator-proof bomas** (livestock enclosures)
- **Compensation schemes** for livestock losses
- **Education programs** for local communities

### Sustainable Tourism

At Enchipai, we're committed to minimizing our environmental impact:

- **Solar power** for all camp operations
- **Water recycling** systems
- **Locally sourced food** where possible
- **Zero single-use plastics**
- **Carbon offset programs**

### How You Can Help

As a guest at Enchipai, you're already contributing to conservation through:
- Conservancy fees that support ranger salaries
- Employment for local community members
- Reduced pressure on land from alternative uses

### The Future

Conservation is a long-term commitment. With continued support from visitors like you, the Masai Mara can remain a sanctuary for wildlife for generations to come.

*Join us in protecting this precious wilderness.*
    `,
    image: "/images/wildlife.jpg",
    category: "conservation",
    date: "December 5, 2025",
    readTime: "5 min read",
    featured: false,
    author: {
      name: "Dr. Jane Mutua",
      role: "Conservation Partner",
      avatar: "/images/hero-safari.jpg"
    },
    tags: ["Conservation", "Sustainability", "Wildlife Protection", "Community"],
    status: "published"
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug || post.id.toString() === slug);
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = getBlogPost(currentSlug);
  if (!currentPost) return blogPosts.slice(0, limit);
  
  return blogPosts
    .filter(post => post.slug !== currentSlug && post.category === currentPost.category)
    .slice(0, limit);
}
