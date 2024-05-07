const filetypes = {
	".jpeg": "image/jpeg",
	".png": "image/png",
	// ".txt": "text/text",
} as const;
type Filetypes = typeof filetypes;

export type FileEndings = keyof Filetypes;
export type MimeTypes = Filetypes[FileEndings];

export function isValidFileEnding(extension: string): extension is FileEndings {
	return filetypes[extension as FileEndings] !== undefined;
}
export function isValidMimetype<T extends keyof Filetypes>(
	mimetype: Filetypes[T],
): mimetype is Filetypes[T] {
	return Object.values(filetypes).includes(mimetype);
}

export function getFiletypeForExtension<T extends keyof Filetypes>(
	extension: T,
): Filetypes[T] {
	if (filetypes[extension]) {
		return filetypes[extension];
	}
	throw new Error("Unknown filetype");
}

export function getExtensionForFiletype<T extends keyof Filetypes>(
	type: Filetypes[T],
): T {
	const extension = Object.entries(filetypes).find(
		([, value]) => value === type,
	);
	if (extension) {
		return extension[0] as T;
	}
	throw new Error("Unknown extension");
}
