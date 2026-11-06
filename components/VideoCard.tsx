"use client"
import { useState , useEffect , useRef ,useCallback} from 'react'
import { getCldImageUrl , getCldVideoUrl } from "next-cloudinary";
import {Download ,Clock,FileDown,FileUp} from "lucide-react"
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Video } from '@/app/generated/prisma/browser';
dayjs.extend(relativeTime)

interface VideoCardProps {
    video:Video;
    onDownload?: (url: string,title: string) => void;
    
}
export default function VideoCard({video, onDownload}:VideoCardProps) {

    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);


    const getThumbnailUrl = useCallback(() => {

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Video Card</h2>
        <video controls className="w-full h-auto rounded-lg">
            <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    </div>

  )
}
