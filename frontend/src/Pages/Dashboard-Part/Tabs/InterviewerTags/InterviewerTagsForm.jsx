// import React, { useState, useEffect } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { base44 } from '@/api/base44Client';
// import { Link, useNavigate } from 'react-router-dom';
// import { createPageUrl } from '../utils';
// import { 
//   ArrowLeft, Save, Tags, Palette
// } from 'lucide-react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Switch } from '@/components/ui/switch';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';

// const colorOptions = [
//   { value: '#217989', label: 'Teal' },
//   { value: '#6366f1', label: 'Indigo' },
//   { value: '#8b5cf6', label: 'Purple' },
//   { value: '#ec4899', label: 'Pink' },
//   { value: '#f59e0b', label: 'Amber' },
//   { value: '#10b981', label: 'Emerald' },
//   { value: '#3b82f6', label: 'Blue' },
//   { value: '#ef4444', label: 'Red' },
//   { value: '#64748b', label: 'Slate' },
//   { value: '#84cc16', label: 'Lime' },
//   { value: '#06b6d4', label: 'Cyan' },
//   { value: '#f97316', label: 'Orange' },
// ];

// export default function CreateInterviewerTag() {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const urlParams = new URLSearchParams(window.location.search);
//   const editId = urlParams.get('id');

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     color: '#217989',
//     category: 'skill',
//     is_active: true
//   });

//   const { data: existingTag, isLoading: loadingTag } = useQuery({
//     queryKey: ['tag', editId],
//     queryFn: () => base44.entities.InterviewerTag.filter({ id: editId }),
//     enabled: !!editId
//   });

//   useEffect(() => {
//     if (existingTag?.[0]) {
//       const t = existingTag[0];
//       setFormData({
//         name: t.name || '',
//         description: t.description || '',
//         color: t.color || '#217989',
//         category: t.category || 'skill',
//         is_active: t.is_active !== false
//       });
//     }
//   }, [existingTag]);

//   const saveMutation = useMutation({
//     mutationFn: (data) => {
//       if (editId) {
//         return base44.entities.InterviewerTag.update(editId, data);
//       }
//       return base44.entities.InterviewerTag.create(data);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(['tags']);
//       navigate(createPageUrl('InterviewerTags'));
//     }
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     saveMutation.mutate(formData);
//   };

//   if (editId && loadingTag) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(33,121,137)]"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <Link to={createPageUrl('InterviewerTags')}>
//           <Button variant="ghost" size="icon">
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//         </Link>
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
//             {editId ? 'Edit Tag' : 'Create Tag'}
//           </h1>
//           <p className="text-slate-500 mt-1">
//             {editId ? 'Update tag details' : 'Create a new interviewer tag'}
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit}>
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Tags className="w-5 h-5 text-[rgb(33,121,137)]" />
//               Tag Information
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <Label htmlFor="name">Tag Name *</Label>
//                 <Input
//                   id="name"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   placeholder="React Expert"
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="category">Category</Label>
//                 <Select 
//                   value={formData.category} 
//                   onValueChange={(val) => setFormData({ ...formData, category: val })}
//                 >
//                   <SelectTrigger>
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="skill">Skill</SelectItem>
//                     <SelectItem value="level">Experience Level</SelectItem>
//                     <SelectItem value="department">Department</SelectItem>
//                     <SelectItem value="certification">Certification</SelectItem>
//                     <SelectItem value="language">Language</SelectItem>
//                     <SelectItem value="other">Other</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="color">Tag Color</Label>
//               <div className="grid grid-cols-6 gap-2">
//                 {colorOptions.map(color => (
//                   <button
//                     key={color.value}
//                     type="button"
//                     className={`w-full aspect-square rounded-lg border-2 transition-all ${
//                       formData.color === color.value 
//                         ? 'border-slate-900 scale-110' 
//                         : 'border-transparent hover:scale-105'
//                     }`}
//                     style={{ backgroundColor: color.value }}
//                     onClick={() => setFormData({ ...formData, color: color.value })}
//                     title={color.label}
//                   />
//                 ))}
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="description">Description</Label>
//               <Textarea
//                 id="description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 placeholder="Describe what this tag represents..."
//                 rows={3}
//               />
//             </div>

//             <div className="flex items-center gap-3 pt-4 border-t">
//               <Switch
//                 checked={formData.is_active}
//                 onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
//               />
//               <Label className="cursor-pointer">Active tag</Label>
//             </div>

//             {/* Preview */}
//             <div className="pt-4 border-t">
//               <Label className="text-sm text-slate-500 mb-2 block">Preview</Label>
//               <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
//                 <div 
//                   className="w-5 h-5 rounded-full" 
//                   style={{ backgroundColor: formData.color }}
//                 />
//                 <span className="font-medium text-slate-900">{formData.name || 'Tag Name'}</span>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <div className="flex justify-end gap-4 mt-6">
//           <Link to={createPageUrl('InterviewerTags')}>
//             <Button type="button" variant="outline">Cancel</Button>
//           </Link>
//           <Button 
//             type="submit" 
//             className="bg-[rgb(33,121,137)] hover:bg-[rgb(28,100,115)] gap-2"
//             disabled={saveMutation.isPending}
//           >
//             <Save className="w-4 h-4" />
//             {saveMutation.isPending ? 'Saving...' : (editId ? 'Update Tag' : 'Create Tag')}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// }