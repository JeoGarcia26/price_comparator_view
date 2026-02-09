const API_BASE_URL = 'https://api.example.com';

/* 
https://serpapi.com/search.json?engine=google&q=Coffee&location=Luanda%2C+Luanda+Province%2C+
                    Angola&google_domain=google.com&gl=us&hl=en&safe=active&tbm=shop&start=20&
                            api_key=efa21f174f714aa15ee75528b2f34777b2a029b25b9b9278dd84ca37fae22faf

const { getJson } = require("serpapi");

getJson({
  api_key: "efa21f174f714aa15ee75528b2f34777b2a029b25b9b9278dd84ca37fae22faf",
  engine: "google",
  google_domain: "google.com",
  q: "Coffee",
  hl: "en",
  gl: "us",
  location: "Luanda, Luanda Province, Angola",
  safe: "active",
  start: "20",
  tbm: "shop"
}, (json) => {
  console.log(json);
}); */

const api = {
    get: async (url = API_BASE_URL, endpoint) => {
        try {
            const response = await fetch(`${url}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    },

    post: async (endpoint, data) => {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    },
};

export default api;