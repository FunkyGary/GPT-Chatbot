import axios from "axios";

const extractFiltersFromQuery = (query: string) => {
    const filters: {
        keywords?: string;
        publicationYear?: number;
        citationCount?: number;
        isOpenAccess?: boolean;
    } = {};

    // Extract keywords (everything before any year or citation count)
    const keywordsMatch = query.match(
        /(.*)(?=published|citations|open|year|before|after|with|more|less|than|citations|exactly|greater)/i
    );
    filters.keywords = keywordsMatch ? keywordsMatch[1].trim() : "";

    // Extract publication year (e.g., "after 2015", "before 2020", or exact "in 2018")
    const yearMatch = query.match(
        /(?:published\s)?(?:after|before|in|since)\s(\d{4})/i
    );
    if (yearMatch) {
        filters.publicationYear = parseInt(yearMatch[1]);
    }

    // Extract citation count (e.g., "more than 50 citations", "exactly 100 citations")
    const citationMatch = query.match(
        /(?:more|less|than|exactly|with)\s(\d+)\s(citations?)/i
    );
    if (citationMatch) {
        filters.citationCount = parseInt(citationMatch[1]);
    }

    // Check if the user requested open access articles
    if (/open\saccess/i.test(query)) {
        filters.isOpenAccess = true;
    }

    return filters;
};

const buildOpenAlexApiUrl = (filters: {
    keywords?: string;
    publicationYear?: number;
    citationCount?: number;
    isOpenAccess?: boolean;
}) => {
    const baseUrl = "https://api.openalex.org/works?filter=";
    const filterParams: string[] = [];

    // Add keyword search
    if (filters.keywords) {
        filterParams.push(
            `default.search:${encodeURIComponent(filters.keywords)}`
        );
    }

    // Add publication year filter
    if (filters.publicationYear) {
        filterParams.push(`publication_year:>${filters.publicationYear}`);
    }

    // Add citation count filter
    if (filters.citationCount) {
        filterParams.push(`cited_by_count:>${filters.citationCount}`);
    }

    // Add open access filter
    if (filters.isOpenAccess) {
        filterParams.push("is_oa:true");
    }

    // Combine all filters into a single API query string
    const apiUrl = `${baseUrl}${filterParams.join(",")}`;
    return apiUrl;
};

// Example usage
const filtersForApi = {
    keywords: "artificial intelligence",
    publicationYear: 2015,
    citationCount: 50,
    isOpenAccess: true,
};

const fetchArticles = async (apiUrl: string) => {
    try {
        const response = await axios.get(apiUrl);
        return response.data.results; // assuming 'results' holds the array of articles
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
};

const handleUserQuery = async (query: string) => {
    const filters = extractFiltersFromQuery(query);

    // Validate that we extracted at least one useful filter
    if (
        !filters.keywords &&
        !filters.publicationYear &&
        !filters.citationCount
    ) {
        return "Sorry, I couldn't understand your query. Please try again with specific keywords, year, or citation count.";
    }

    const apiUrl = buildOpenAlexApiUrl(filters);

    // Fetch the articles
    const articles = await fetchArticles(apiUrl);

    if (articles.length === 0) {
        return "No articles were found based on your search criteria. Please try adjusting your filters.";
    }

    // You could also format the articles and return them to the chatbot interface
    return `I found ${articles.length} articles related to your query. Here's the first one: ${articles[0].title}`;
};
