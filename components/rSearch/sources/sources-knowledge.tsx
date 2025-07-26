import type { SerperResponse } from '@/types/search';

interface KnowledgeGraphProps {
  data: SerperResponse['knowledgeGraph'];
}

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  if (!data) return null;

  return (
    <div className="col-span-2 w-full">
      <div className="group relative flex w-full items-stretch">
        <div className="flex w-full rounded-lg transition duration-300 bg-gray-50/50 hover:bg-gray-100/50">
          <div className="flex w-full p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full">
              {/* Image Column */}
              {data.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={data.imageUrl}
                    alt={data.title}
                    className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
              
              {/* Content Column */}
              <div className="flex-grow space-y-4">
                {/* Header */}
                <div>
                  <h3 className="text-xl md:text-2xl font-semibold text-blue-500 leading-tight">
                    {data.title}
                  </h3>
                  <p className="text-sm md:text-base text-blue-400 mt-1">
                    {data.type}
                  </p>
                </div>

                {/* Attributes Grid */}
                {data.attributes && Object.entries(data.attributes).length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.entries(data.attributes).map(([key, value]) => (
                      <div 
                        key={key} 
                        className="flex flex-col p-2 rounded-md bg-white/50"
                      >
                        <span className="text-xs font-medium text-blue-400 mb-1">
                          {key}
                        </span>
                        <span className="text-sm text-gray-700">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
