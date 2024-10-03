import axios from "axios";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
    console.error("REACT_APP_OPENAI_API_KEY is not set in the environment");
}

export interface Filters {
    keywords?: string;
    publicationYear?: { min?: number; max?: number };
    citationCount?: { min?: number; max?: number };
    isOpenAccess?: boolean;
}

export const extractFiltersFromQuery = (query: string): Filters => {
    const filters: Filters = {};

    // Extract keywords
    const keywordsMatch = query.match(
        /(.*)(?=published|citations|open|year|before|after|with|more|less|than|citations|exactly|greater)/i
    );
    filters.keywords = keywordsMatch ? keywordsMatch[1].trim() : query.trim();

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
    filters.isOpenAccess = /open\saccess/i.test(query);

    return filters;
};

export const buildOpenAlexApiUrl = (filters: Filters): string => {
    const baseUrl = "https://api.openalex.org/works?";
    const params: string[] = [];

    if (filters.keywords) {
        params.push(`search=${encodeURIComponent(filters.keywords)}`);
    }

    if (filters.publicationYear) {
        if (filters.publicationYear.min && filters.publicationYear.max) {
            params.push(
                `publication_year:${filters.publicationYear.min}-${filters.publicationYear.max}`
            );
        } else if (filters.publicationYear.min) {
            params.push(`publication_year:>${filters.publicationYear.min}`);
        } else if (filters.publicationYear.max) {
            params.push(`publication_year:<${filters.publicationYear.max}`);
        }
    }

    if (filters.citationCount) {
        if (filters.citationCount.min && filters.citationCount.max) {
            params.push(
                `cited_by_count:${filters.citationCount.min}-${filters.citationCount.max}`
            );
        } else if (filters.citationCount.min) {
            params.push(`cited_by_count:>${filters.citationCount.min}`);
        } else if (filters.citationCount.max) {
            params.push(`cited_by_count:<${filters.citationCount.max}`);
        }
    }

    if (filters.isOpenAccess) {
        params.push("is_oa:true");
    }

    return `${baseUrl}${params.join("&")}`;
};

export const fetchArticles = async (apiUrl: string) => {
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error("Error fetching articles:", error);
        return null;
    }
};

export const callOpenAI = async (prompt: string) => {
    try {
        const messages = [
            {
                role: "system",
                content:
                    "You are a helpful assistant that summarizes research articles.",
            },
            {
                role: "user",
                content: prompt,
            },
        ];

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: messages,
                max_tokens: 100,
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                },
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error(
            "Error calling OpenAI API:",
            error.response ? error.response.data : error
        );
        return null;
    }
};

export interface Article {
    title: string;
    publicationDate: string;
    primaryTopic: string;
    keywords: string[];
    citationCount: number;
    citationNormalizedPercentile: number;
    fwci: number;
}

export interface BotResponse {
    summary: string;
    articles: Article[];
}

export const handleUserQuery = async (
    query: string
): Promise<BotResponse | string> => {
    try {
        const filters = extractFiltersFromQuery(query);

        if (
            !filters.keywords &&
            !filters.publicationYear &&
            !filters.citationCount &&
            !filters.isOpenAccess
        ) {
            return "Sorry, I couldn't understand your query. Please try again with specific keywords, year, citation count, or open access filter.";
        }

        const apiUrl = buildOpenAlexApiUrl(filters);
        const results = await fetchArticles(apiUrl);

        if (!results || !results.meta || results.meta.count === 0) {
            return "No articles were found based on your search criteria. Please try adjusting your filters.";
        }

        const filteredArticles: Article[] = results.results.map(
            (item: any) => ({
                title: item.title,
                publicationDate: item.publication_date,
                primaryTopic: item.primary_topic?.display_name || "N/A",
                keywords:
                    item.keywords?.map(
                        (keyword: any) => keyword.display_name
                    ) || [],
                citationCount: item.cited_by_count,
                citationNormalizedPercentile:
                    item.citation_normalized_percentile?.value,
                fwci: item.fwci,
            })
        );

        const openAiPrompt = `Summarize the following search response metadata: ${JSON.stringify(
            results.meta
        )}. 
        Provide a conversational summary. The example output: I found 5 artificial intelligence research articles published since 2015, each with exactly 100 citations.
        And then, summarize the following responded articles: ${JSON.stringify(
            filteredArticles
        )}.
        Provide a conversational summary. The example output: These papers span diverse AI applications including healthcare, climate change, ethics, natural language processing, and finance. Published between 2015 and 2021, with 3 being open access, they represent influential work across various AI domains in recent years.`;

        const openAiResponse = await callOpenAI(openAiPrompt);

        if (!openAiResponse) {
            return {
                summary: `I found ${results.meta.count} articles related to your query about "${filters.keywords}". Here are some details about the first few:`,
                articles: filteredArticles.slice(0, 5),
            };
        }

        return {
            summary: openAiResponse,
            articles: filteredArticles,
        };
    } catch (error) {
        console.error("Error in handleUserQuery:", error);
        return "An error occurred while processing your query. Please try again later.";
    }
};
