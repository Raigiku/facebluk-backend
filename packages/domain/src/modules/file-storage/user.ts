// accessors
export type FnUploadProfilePicture = (userId: string, bytes: Buffer) => Promise<string>
export type FnGetProfilePictureUrl = (userId: string) => string
