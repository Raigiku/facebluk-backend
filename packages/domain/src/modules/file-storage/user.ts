// accessors
export type FnUploadProfilePicture = (userId: string, bytes: ArrayBuffer) => Promise<void>
export type FnGetProfilePictureUrl = (userId: string) => string
