const User = require("./lib/user"),
    lists = require("./lib/lists"),
    media = require("./lib/media"),
    people = require("./lib/people"),
    util = require("./lib/utilities");

module.exports = class AniList {
    /**
     * @constructor
     * @param {String} [accessKey] - The AniList API token. If no key is provided, 
     *      the user will not be able to access private information such as 
     *      the authorized user's profile (if set to private).
     */
    constructor (accessKey) {
        if (!accessKey) { accessKey == null; }

        // Import utilites for the classes.
        this.__util = new util(accessKey);

        this.user = new User(this.__util);
        this.lists = new lists(this.__util);
        this.media = new media(this.__util);
        this.people = new people(this.__util);
    };

    /**
     * Grabs data on a studio
     * @param {String | Number} id - The studio ID or name on AniList.
     * @returns { Object } Returns a customized data object.
     */
    studio(id) {
        var queryVars = this.__util.generateQueryHeaders("Studio", id);

        return this.__util.send(queryVars[1] + `id name isAnimationStudio siteUrl isFavourite favourites 
            media { nodes { id title { romaji english native userPreferred } } } } }`, queryVars[0]);
    };

    /**
     * Searchs AniList based on a specific term.
     * @param {String} type - Required. Either anime, manga, character, staff or studio. 
     * @param {String} term - Required. The term to lookup.
     * @param {Number} page - Which page of the results to look at. Will default to 1 if not provided.
     * @param {Number} amount - The amount of results per page. AniList will cap this at 25 and function will default to 5 if not provided.
     */
    search(type, term, page=1, amount=5) {
        if (!type) { throw new Error("Type of search not defined!"); }
        else if (!term) { throw new Error("Search term was not provided!"); }

        //Validate all type conditions.
        if (typeof type !== "string") { throw new Error("Type is not a string."); }
        if (typeof term !== "string") { throw new Error("Term is not a string"); }
        if (typeof page !== "number") { throw new Error("Page number is not a number"); }
        if (typeof amount !== "number") { throw new Error("Amount is not a number"); }
        
        var search = {
            "anime": "media (type: ANIME, search: $search) { id title { romaji english native userPreferred } coverImage { large medium } status startDate { year month day } endDate { year month day } type format }",
            "manga": "media (type: MANGA, search: $search) { id title { romaji english native userPreferred } coverImage { large medium } status startDate { year month day } endDate { year month day } type format }",
            "char": "characters (search: $search) { id name { english: full } }" ,
            "staff": "staff (search: $search) { id name { english: full } }",
            "studio": "studios (search: $search) { id name }"
        }

        switch (type.toLowerCase()) {
            case "anime": var query = search["anime"]; break;
            case "manga": var query = search["manga"]; break;
            case "character": var query = search["char"]; break;
            case "staff": var query = search["staff"]; break;
            case "studio": var query = search["studio"]; break;
            default: throw new Error("Type not supported.");
        }
		
        return this.__util.send(`query ($page: Int, $perPage: Int, $search: String) {
        Page (page: $page, perPage: $perPage) { pageInfo { total currentPage lastPage hasNextPage perPage } ${query} } }`, { search: term, page: page, perPage: amount});
    };
};
