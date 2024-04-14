import { customAlphabet } from "nanoid";

// we want to use a custom alphabet so that all of our IDs can be double clicked to select
const alphabet =
	"ABCDEFGHIJKMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz1234567890_";
export const generateId = customAlphabet(alphabet);
