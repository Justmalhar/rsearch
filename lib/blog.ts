import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishDate: string;
  author: string;
  readTime: string;
  category: string;
  keywords: string[];
  content: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllBlogPosts(): BlogPost[] {
  // Check if posts directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, '');

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents);

      // Validate required fields
      const requiredFields = ['title', 'description', 'publishDate', 'author', 'readTime', 'category', 'keywords'];
      const missingFields = requiredFields.filter(field => !matterResult.data[field]);
      
      if (missingFields.length > 0) {
        console.warn(`Blog post ${slug} is missing required fields: ${missingFields.join(', ')}`);
        return null;
      }

      // Combine the data with the slug
      return {
        slug,
        title: matterResult.data.title,
        description: matterResult.data.description,
        publishDate: matterResult.data.publishDate,
        author: matterResult.data.author,
        readTime: matterResult.data.readTime,
        category: matterResult.data.category,
        keywords: matterResult.data.keywords || [],
        content: matterResult.content,
      } as BlogPost;
    })
    .filter((post): post is BlogPost => post !== null);

  // Sort posts by publish date in descending order (newest first)
  return allPostsData.sort((a, b) => {
    return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
  });
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    // Validate required fields
    const requiredFields = ['title', 'description', 'publishDate', 'author', 'readTime', 'category', 'keywords'];
    const missingFields = requiredFields.filter(field => !matterResult.data[field]);
    
    if (missingFields.length > 0) {
      console.warn(`Blog post ${slug} is missing required fields: ${missingFields.join(', ')}`);
      return null;
    }

    return {
      slug,
      title: matterResult.data.title,
      description: matterResult.data.description,
      publishDate: matterResult.data.publishDate,
      author: matterResult.data.author,
      readTime: matterResult.data.readTime,
      category: matterResult.data.category,
      keywords: matterResult.data.keywords || [],
      content: matterResult.content,
    } as BlogPost;
  } catch (error) {
    console.error(`Error reading blog post ${slug}:`, error);
    return null;
  }
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  return allPosts.filter(post => 
    post.category.toLowerCase() === category.toLowerCase()
  );
}

export function getAllCategories(): string[] {
  const allPosts = getAllBlogPosts();
  const categories = new Set(allPosts.map(post => post.category));
  return Array.from(categories).sort();
}

export function searchBlogPosts(query: string): BlogPost[] {
  const allPosts = getAllBlogPosts();
  const searchTerm = query.toLowerCase();
  
  return allPosts.filter(post => 
    post.title.toLowerCase().includes(searchTerm) ||
    post.description.toLowerCase().includes(searchTerm) ||
    post.content.toLowerCase().includes(searchTerm) ||
    post.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
    post.category.toLowerCase().includes(searchTerm)
  );
}