// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { base44 } from '@/api/base44Client';
// import { Link } from 'react-router-dom';
// import { createPageUrl } from '../utils';
// import {
//   Tags, Plus, Search, MoreVertical, Edit2, Trash2,
//   Users, Info, CheckCircle, Eye
// } from 'lucide-react';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import { Skeleton } from '@/components/ui/skeleton';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// export default function InterviewerTags() {
//   const queryClient = useQueryClient();
//   const [search, setSearch] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('all');
//   const [deleteId, setDeleteId] = useState(null);

//   const { data: tags = [], isLoading } = useQuery({
//     queryKey: ['tags'],
//     queryFn: () => base44.entities.InterviewerTag.list('-created_date', 100)
//   });

//   const { data: interviewers = [] } = useQuery({
//     queryKey: ['interviewers'],
//     queryFn: () => base44.entities.Interviewer.list()
//   });

//   const deleteMutation = useMutation({
//     mutationFn: (id) => base44.entities.InterviewerTag.delete(id),
//     onSuccess: () => {
//       queryClient.invalidateQueries(['tags']);
//       setDeleteId(null);
//     }
//   });

//   const categoryLabels = {
//     skill: 'Skills',
//     level: 'Experience Level',
//     department: 'Department',
//     certification: 'Certifications',
//     language: 'Languages',
//     other: 'Other'
//   };

//   const filteredTags = tags.filter(tag => {
//     const matchesSearch = tag.name?.toLowerCase().includes(search.toLowerCase()) ||
//                          tag.description?.toLowerCase().includes(search.toLowerCase());
//     const matchesCategory = categoryFilter === 'all' || tag.category === categoryFilter;
//     return matchesSearch && matchesCategory;
//   });

//   const getInterviewerCount = (tagId) => {
//     return interviewers.filter(i => i.tag_ids?.includes(tagId)).length;
//   };

//   // Group tags by category
//   const tagsByCategory = filteredTags.reduce((acc, tag) => {
//     const category = tag.category || 'other';
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(tag);
//     return acc;
//   }, {});

//   return (
//     <div className="space-y-6">
//       {/* Info Banner */}
//       <Alert className="bg-[rgb(33,121,137)]/5 border-[rgb(33,121,137)]/20">
//         <Info className="h-4 w-4 text-[rgb(33,121,137)]" />
//         <AlertDescription className="text-slate-700">
//           <strong className="text-[rgb(33,121,137)]">Interviewer Tags</strong> are the recommended way to categorize and match interviewers to specific interview rounds.
//           Tags represent expertise areas like skills, certifications, experience levels, or languages. When setting up interview templates or positions,
//           you can specify which tags are required for each round, and the system will automatically suggest matching interviewers.
//           <div className="mt-2 flex items-start gap-2">
//             <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
//             <span><strong>Best for:</strong> Granular expertise matching, flexible interviewer assignment, cross-functional interview panels</span>
//           </div>
//         </AlertDescription>
//       </Alert>

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Interviewer Tags</h1>
//           <p className="text-slate-500 mt-1">Categorize interviewers by expertise and skills</p>
//         </div>
//         <Link to={createPageUrl('CreateInterviewerTag')}>
//           <Button className="bg-[rgb(33,121,137)] hover:bg-[rgb(28,100,115)] gap-2">
//             <Plus className="w-4 h-4" />
//             Create Tag
//           </Button>
//         </Link>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1 max-w-md">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//           <Input
//             placeholder="Search tags..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-10"
//           />
//         </div>
//         <Select value={categoryFilter} onValueChange={setCategoryFilter}>
//           <SelectTrigger className="w-full sm:w-48">
//             <SelectValue placeholder="Filter by category" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Categories</SelectItem>
//             <SelectItem value="skill">Skills</SelectItem>
//             <SelectItem value="level">Experience Level</SelectItem>
//             <SelectItem value="department">Department</SelectItem>
//             <SelectItem value="certification">Certifications</SelectItem>
//             <SelectItem value="language">Languages</SelectItem>
//             <SelectItem value="other">Other</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Tags List */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[1,2,3,4,5,6].map(i => (
//             <Card key={i}>
//               <CardContent className="p-6">
//                 <div className="flex items-center gap-3">
//                   <Skeleton className="w-4 h-4 rounded-full" />
//                   <Skeleton className="h-5 w-24" />
//                 </div>
//                 <Skeleton className="h-4 w-full mt-2" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       ) : filteredTags.length === 0 ? (
//         <Card>
//           <CardContent className="p-12 text-center">
//             <Tags className="w-16 h-16 mx-auto text-slate-300 mb-4" />
//             <h3 className="text-lg font-semibold text-slate-900">No tags found</h3>
//             <p className="text-slate-500 mt-1">
//               {search || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Create your first tag to get started'}
//             </p>
//             <Link to={createPageUrl('CreateInterviewerTag')}>
//               <Button className="mt-4 bg-[rgb(33,121,137)] hover:bg-[rgb(28,100,115)]">
//                 <Plus className="w-4 h-4 mr-2" />
//                 Create Tag
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       ) : (
//         <div className="space-y-8">
//           {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
//             <div key={category}>
//               <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                 <Tags className="w-5 h-5 text-[rgb(33,121,137)]" />
//                 {categoryLabels[category] || category}
//                 <Badge variant="secondary" className="ml-2">{categoryTags.length}</Badge>
//               </h2>
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                 {categoryTags.map((tag) => (
//                   <Card key={tag.id} className="hover:shadow-lg transition-shadow group">
//                     <CardContent className="p-5">
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className="w-5 h-5 rounded-full flex-shrink-0"
//                             style={{ backgroundColor: tag.color || '#94a3b8' }}
//                           />
//                           <div>
//                             <h3 className="font-semibold text-slate-900">{tag.name}</h3>
//                             {tag.description && (
//                               <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{tag.description}</p>
//                             )}
//                           </div>
//                         </div>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
//                               <MoreVertical className="w-4 h-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem asChild>
//                               <Link to={createPageUrl(`CreateInterviewerTag?id=${tag.id}`)}>
//                                 <Eye className="w-4 h-4 mr-2" />
//                                 View / Edit
//                               </Link>
//                             </DropdownMenuItem>
//                             <DropdownMenuItem
//                               className="text-red-600"
//                               onClick={() => setDeleteId(tag.id)}
//                             >
//                               <Trash2 className="w-4 h-4 mr-2" />
//                               Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </div>

//                       <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
//                         <div className="flex items-center gap-2 text-sm text-slate-600">
//                           <Users className="w-4 h-4 text-slate-400" />
//                           <span>{getInterviewerCount(tag.id)} interviewers</span>
//                         </div>
//                         {tag.is_active !== false ? (
//                           <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
//                         ) : (
//                           <Badge className="bg-slate-100 text-slate-700 text-xs">Inactive</Badge>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
//             <AlertDialogDescription>
//               This action cannot be undone. This will permanently delete the tag and remove it from all associated interviewers.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               className="bg-red-600 hover:bg-red-700"
//               onClick={() => deleteMutation.mutate(deleteId)}
//             >
//               Delete
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Tags,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Users,
  Info,
  CheckCircle,
  Eye,
} from "lucide-react";
import Header from "../../../../Components/Shared/Header/Header";
import { usePermissions } from "../../../../Context/PermissionsContext";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField"; // Adjust path as necessary
const createPageUrl = (path) => `/${path}`;

// --- DUMMY DATA ---
const DUMMY_TAGS = [
  {
    id: "1",
    name: "React.js",
    category: "skill",
    description: "Frontend expertise in React and Hooks",
    color: "#61dafb",
    is_active: true,
  },
  {
    id: "2",
    name: "React.js",
    category: "skill",
    description: "Frontend expertise in React and Hooks",
    color: "#61dafb",
    is_active: true,
  },
  {
    id: "3",
    name: "React.js",
    category: "skill",
    description: "Frontend expertise in React and Hooks",
    color: "#61dafb",
    is_active: true,
  },
  {
    id: "4",
    name: "React.js",
    category: "skill",
    description: "Frontend expertise in React and Hooks",
    color: "#61dafb",
    is_active: true,
  },
  {
    id: "5",
    name: "Senior Level",
    category: "level",
    description: "Interviewers with 5+ years experience",
    color: "#334155",
    is_active: true,
  },
  {
    id: "6",
    name: "AWS Certified",
    category: "certification",
    description: "Cloud practitioner or Solutions Architect",
    color: "#ff9900",
    is_active: true,
  },
  {
    id: "7",
    name: "Spanish",
    category: "language",
    description: "Fluent in Spanish speaking/writing",
    color: "#ef4444",
    is_active: false,
  },
  {
    id: "8",
    name: "Engineering",
    category: "department",
    description: "Core engineering team members",
    color: "#10b981",
    is_active: true,
  },
];

const DUMMY_INTERVIEWERS = [
  { id: "i1", name: "John Doe", tag_ids: ["1", "2", "5"] },
  { id: "i2", name: "Jane Smith", tag_ids: ["3", "5"] },
  { id: "i3", name: "Carlos Ray", tag_ids: ["4"] },
];

export default function InterviewerTags() {
  // State management instead of React Query Hooks
  const [tags, setTags] = useState(DUMMY_TAGS);
  const [interviewers] = useState(DUMMY_INTERVIEWERS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Can be toggled to test skeleton

  const { effectivePermissions, isInitialized } = usePermissions();

  const categoryLabels = {
    skill: "Skills",
    level: "Experience Level",
    department: "Department",
    certification: "Certifications",
    language: "Languages",
    other: "Other",
  };

  // --- LOGIC ---
  const handleDelete = (id) => {
    setTags(tags.filter((t) => t.id !== id));
    setDeleteId(null);
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name?.toLowerCase().includes(search.toLowerCase()) ||
      tag.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || tag.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getInterviewerCount = (tagId) => {
    return interviewers.filter((i) => i.tag_ids?.includes(tagId)).length;
  };

  const tagsByCategory = filteredTags.reduce((acc, tag) => {
    const category = tag.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {});

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Info Banner */}
      <div className="bg-[rgb(33,121,137)]/5 border border-[rgb(33,121,137)]/20 rounded-lg p-4 flex gap-3">
        <Info className="h-5 w-5 text-[rgb(33,121,137)] flex-shrink-0" />
        <div className="text-sm text-slate-700">
          <strong className="text-[rgb(33,121,137)]">Interviewer Tags</strong>{" "}
          are the recommended way to categorize and match interviewers to
          specific interview rounds. Tags represent expertise areas like skills,
          certifications, experience levels, or languages. When setting up
          interview templates or positions, you can specify which tags are
          required for each round, and the system will automatically suggest
          matching interviewers.
          <div className="mt-2 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Best for:</strong> Granular expertise matching, flexible
              interviewer assignment, cross-functional interview panels
            </span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col mb-4">
        <Header
          title="Interviewer Tags"
          onAddClick
          addButtonText="Create Tag"
          canCreate={effectivePermissions.InterviewerTags?.Create}
        />
        <p className="text-slate-500">
          Categorize interviewers by expertise and skills
        </p>
      </div>

      {/* Filters */}
      {/* Filters - Aligned to Right */}
      <div className="flex justify-end gap-4 w-full mb-4 items-end">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent h-10"
          />
        </div>

        {/* Dropdown */}
        <div className="w-64">
          <DropdownWithSearchField
            value={categoryFilter}
            options={[
              { value: "all", label: "All Categories" },
              ...Object.entries(categoryLabels).map(([val, label]) => ({
                value: val,
                label: label,
              })),
            ]}
            name="categoryFilter"
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter by category"
            isSearchable={true}
          />
        </div>
      </div>

      {/* Tags List */}
      {isLoading ? (
        <div>
          {/* Shimmer Category Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-5 h-5 rounded-full shimmer"></div>
            <div className="h-5 w-40 rounded shimmer"></div>
            <div className="h-4 w-8 rounded-full shimmer"></div>
          </div>

          {/* Shimmer Cards Grid */}
          <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="relative bg-white border border-slate-200 rounded-xl p-5"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full shimmer"></div>

                    <div className="space-y-2">
                      <div className="h-4 w-32 rounded shimmer"></div>
                      <div className="h-3 w-48 rounded shimmer"></div>
                    </div>
                  </div>

                  <div className="w-6 h-6 rounded shimmer"></div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded shimmer"></div>
                    <div className="h-3 w-28 rounded shimmer"></div>
                  </div>

                  <div className="h-4 w-14 rounded-full shimmer"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center">
          <Tags className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900">
            No tags found
          </h3>
          <p className="text-slate-500 mt-1">
            Try adjusting your filters or create a new one.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Tags className="w-5 h-5 text-[rgb(33,121,137)]" />
                {categoryLabels[category] || category}
                <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                  {categoryTags.length}
                </span>
              </h2>
              <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {categoryTags.map((tag) => (
                  <div
                    key={tag.id}
                    className="relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color || "#94a3b8" }}
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {tag.name}
                          </h3>
                          {tag.description && (
                            <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                              {tag.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Custom Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === tag.id ? null : tag.id)
                          }
                          className="p-1 rounded-md hover:bg-slate-100 text-slate-400 group-hover:text-slate-600"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === tag.id && (
                          <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
                            <Link
                              to={createPageUrl(
                                `CreateInterviewerTag?id=${tag.id}`,
                              )}
                              className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View / Edit
                            </Link>
                            <button
                              onClick={() => {
                                setDeleteId(tag.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{getInterviewerCount(tag.id)} interviewers</span>
                      </div>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          tag.is_active !== false
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {tag.is_active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Delete Confirmation Dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900">Delete Tag?</h3>
            <p className="text-slate-500 mt-2">
              This action cannot be undone. This will permanently delete the tag
              and remove it from all associated interviewers.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
