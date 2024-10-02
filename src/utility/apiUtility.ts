import axios from "axios";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error("REACT_APP_OPENAI_API_KEY is not set in the environment");
}

const extractFiltersFromQuery = (query: string) => {
    const filters: {
        keywords?: string;
        publicationYear?: { min?: number; max?: number };
        citationCount?: { min?: number; max?: number };
        isOpenAccess?: boolean;
    } = {};

    // Extract keywords (everything before any year or citation count)
    const keywordsMatch = query.match(
        /(.*)(?=published|citations|open|year|before|after|with|more|less|than|citations|exactly|greater)/i
    );
    filters.keywords = keywordsMatch ? keywordsMatch[1].trim() : "";

    // Extract publication year
    const yearMatch = query.match(
        /(?:published\s)?(?:after|before|in|since|between)\s(\d{4})(?:\s*(?:and|to)\s*(\d{4}))?/i
    );
    if (yearMatch) {
        filters.publicationYear = {};
        if (yearMatch[1] && yearMatch[2]) {
            filters.publicationYear.min = parseInt(yearMatch[1]);
            filters.publicationYear.max = parseInt(yearMatch[2]);
        } else if (query.includes("after") || query.includes("since")) {
            filters.publicationYear.min = parseInt(yearMatch[1]);
        } else if (query.includes("before")) {
            filters.publicationYear.max = parseInt(yearMatch[1]);
        } else {
            filters.publicationYear.min = parseInt(yearMatch[1]);
            filters.publicationYear.max = parseInt(yearMatch[1]);
        }
    }

    // Extract citation count
    const citationMatch = query.match(
        /(?:more|less|than|exactly|with)\s(\d+)(?:\s*(?:to|and)\s*(\d+))?\s*citations?/i
    );
    if (citationMatch) {
        filters.citationCount = {};
        if (citationMatch[2]) {
            filters.citationCount.min = parseInt(citationMatch[1]);
            filters.citationCount.max = parseInt(citationMatch[2]);
        } else if (
            query.includes("more than") ||
            query.includes("greater than")
        ) {
            filters.citationCount.min = parseInt(citationMatch[1]);
        } else if (query.includes("less than")) {
            filters.citationCount.max = parseInt(citationMatch[1]);
        } else {
            filters.citationCount.min = parseInt(citationMatch[1]);
            filters.citationCount.max = parseInt(citationMatch[1]);
        }
    }

    // Check if the user requested open access articles
    if (/open\saccess/i.test(query)) {
        filters.isOpenAccess = true;
    }

    return filters;
};

const buildOpenAlexApiUrl = (filters: {
    keywords?: string;
    publicationYear?: { min?: number; max?: number };
    citationCount?: { min?: number; max?: number };
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
        if (filters.publicationYear.min && filters.publicationYear.max) {
            filterParams.push(
                `publication_year:${filters.publicationYear.min}-${filters.publicationYear.max}`
            );
        } else if (filters.publicationYear.min) {
            filterParams.push(
                `publication_year:>${filters.publicationYear.min}`
            );
        } else if (filters.publicationYear.max) {
            filterParams.push(
                `publication_year:<${filters.publicationYear.max}`
            );
        }
    }

    // Add citation count filter
    if (filters.citationCount) {
        if (filters.citationCount.min && filters.citationCount.max) {
            filterParams.push(
                `cited_by_count:${filters.citationCount.min}-${filters.citationCount.max}`
            );
        } else if (filters.citationCount.min) {
            filterParams.push(`cited_by_count:>${filters.citationCount.min}`);
        } else if (filters.citationCount.max) {
            filterParams.push(`cited_by_count:<${filters.citationCount.max}`);
        }
    }

    // Add open access filter
    if (filters.isOpenAccess) {
        filterParams.push("is_oa:true");
    }

    // Combine all filters into a single API query string
    const apiUrl = `${baseUrl}${filterParams.join(",")}`;
    return apiUrl;
};

const fetchArticles = async (apiUrl: string) => {
    try {
        const response = await axios.get(apiUrl);
        return response.data; // assuming 'results' holds the array of articles
    } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
    }
};

// New function to interact with OpenAI API
const callOpenAI = async (prompt: string) => {
    try {
        // Truncate prompt if necessary
        // const truncatedPrompt = truncateText(prompt, MAX_TOKENS);

        // Define the messages array required by chat-based models
        const messages = [
            {
                role: "system", // Optional system role providing context
                content:
                    "You are a helpful assistant that summarizes research articles. The example output: I found 5 artificial intelligence research articles published since 2015, each with exactly 100 citations.",
            },
            {
                role: "user", // User's query
                content: prompt, // Use truncated input
            },
        ];

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions", // Chat API endpoint
            {
                model: "gpt-4o-mini", // Specify the model
                messages: messages, // Provide the truncated messages array
                max_tokens: 100, // Response length
                temperature: 0.7, // Control creativity
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content; // Extract the assistant's reply
    } catch (error) {
        console.error(
            "Error calling OpenAI API:",
            error.response ? error.response.data : error
        );
        return null;
    }
};

export const handleUserQuery = async (query: string) => {
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

    // Fetch the articles from OpenAlex
    const results = await fetchArticles(apiUrl);

    if (results.meta.count === 0) {
        return "No articles were found based on your search criteria. Please try adjusting your filters.";
    }

    const filteredArticles = results.results.map((item) => {
        return {
            title: item.title,
            publicationDate: item.publication_date,
            primaryTopic: item.primary_topic.display_name,
            keywords: item.keywords.map((keyword) => keyword.display_name),
            citationCount: item.cited_by_count,
            citationNormalizedPercentile:
                item.citation_normalized_percentile.value,
            fwci: item.fwci,
        };
    });

    // Format the response using OpenAI
    const openAiPrompt = `Summarize the following search response metadata: ${JSON.stringify(
        results.meta
    )}. Provide a conversational summary. The example output: I found 5 artificial intelligence research articles published since 2015, each with exactly 100 citations.
    And then, summarize the following responsed articles: ${JSON.stringify(
        filteredArticles
    )}.
    Provide a conversational summary. The example output: These papers span diverse AI applications including healthcare, climate change, ethics, natural language processing, and finance. Published between 2015 and 2021, with 3 being open access, they represent influential work across various AI domains in recent years.`;

    const openAiResponse = await callOpenAI(openAiPrompt);

    return {
        summary:
            openAiResponse ||
            `I found ${results.meta.count} articles related to your query. Here's the first one: ${results.results[0].title}`,
        articles: filteredArticles,
    };
};
