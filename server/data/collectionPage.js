const image = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;

export const defaultCollectionPageContent = {
  eyebrow: "A NOVA point of view",
  title: "Collections",
  description: "Stories told through the things we make and the ways we wear them.",
  collections: [
    {
      slug: "winter-26",
      title: "Winter '26",
      image: image("photo-1629131678696-0b56fe341b74"),
      story: "Quiet layers for the colder months. Textures to live in, shapes to keep.",
    },
    {
      slug: "everyday-uniform",
      title: "The Everyday Uniform",
      image: image("photo-1551028719-00167b16eac5"),
      story: "A study in useful forms, made to move through the week.",
    },
    {
      slug: "soft-structure",
      title: "Soft Structure",
      image: image("photo-1598554747436-c9293d6a588f"),
      story: "Light layers and considered proportions for a change in season.",
    },
  ],
};
