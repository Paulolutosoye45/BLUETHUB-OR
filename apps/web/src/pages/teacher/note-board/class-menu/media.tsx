import { X, Image, ImageOff } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose, Tooltip, TooltipTrigger, Button, TooltipContent } from '@bluethub/ui-kit';

import PermMedia from "@/assets/svg/perm-media.svg?react";
import { onSetAction } from "@/store/class-action-slice";
import { useDispatch } from "react-redux";
import { useState } from "react";


type media = {
  name: string,
  type: string,
  url?: string
}

// interface IMedia {

// }
const Media = () => {
  const [availableMedia, setAvailableMedia] = useState<media[]>([]);
  const dispatch = useDispatch();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="bg-none">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="hover:bg-transparent cursor-pointer"
                onClick={() => dispatch(onSetAction("media"))}
              >
                <PermMedia className="size-4  text-forestBlue-light cursor-pointer" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" align="center">
              <p>Media</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        className="w-80 p-0 ml-3 border border-gray-200 shadow-lg rounded-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-linear-to-r from-blue-500 to-blue-600">
          <h4 className="font-semibold text-white flex items-center gap-2">
            <PermMedia className="w-5 h-5" />
            Media Library
          </h4>
          <PopoverClose className="text-white hover:bg-white/20 rounded-full p-1 transition-colors">
            <X className="w-5 h-5" />
          </PopoverClose>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {availableMedia.length > 0 ? (
            <div className="p-4 space-y-2">
              {availableMedia.map((media, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {media.name || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {media.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageOff className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">
                No media yet
              </h3>
              <p className="text-xs text-gray-500">
                Upload or record media to see it here
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {availableMedia.length > 0 && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
              View All Media
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default Media;
