// accessors
export type FnUploadProfilePicture = (userId: string, bytes: ArrayBuffer) => Promise<string>
export type FnGetProfilePictureUrl = (userId: string) => string
