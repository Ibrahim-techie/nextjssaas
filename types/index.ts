export interface Video {
  id: string;
  title: string;
  description: string;
  publicId: string;
  originalSize: string;
  compressedSize: string;
  duration: number;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}
