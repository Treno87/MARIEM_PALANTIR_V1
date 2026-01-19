import { useState } from "react";
import { mockDesigners } from "../sale/constants";
import type { Designer } from "../sale/types";

const DEFAULT_COLOR = "#00c875";
const colorOptions = [
	DEFAULT_COLOR,
	"#fdab3d",
	"#e2445c",
	"#a25ddc",
	"#0073ea",
	"#ff7eb3",
	"#00d2d2",
	"#6b7280",
];

interface StaffFormData {
	name: string;
	color: string;
}

export default function StaffPage() {
	const [staff, setStaff] = useState<Designer[]>(mockDesigners);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<Designer | null>(null);
	const [formData, setFormData] = useState<StaffFormData>({
		name: "",
		color: DEFAULT_COLOR,
	});

	const openAddModal = () => {
		setEditingStaff(null);
		setFormData({ name: "", color: DEFAULT_COLOR });
		setIsModalOpen(true);
	};

	const openEditModal = (designer: Designer) => {
		setEditingStaff(designer);
		setFormData({ name: designer.name, color: designer.color });
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setEditingStaff(null);
		setFormData({ name: "", color: DEFAULT_COLOR });
	};

	const handleSubmit = () => {
		if (!formData.name.trim()) return;

		if (editingStaff) {
			setStaff((prev) =>
				prev.map((s) =>
					s.id === editingStaff.id
						? { ...s, name: formData.name, color: formData.color }
						: s,
				),
			);
		} else {
			const newStaff: Designer = {
				id: `staff-${Date.now()}`,
				name: formData.name,
				color: formData.color,
			};
			setStaff((prev) => [...prev, newStaff]);
		}
		closeModal();
	};

	const handleDelete = (id: string) => {
		if (confirm("정말 삭제하시겠습니까?")) {
			setStaff((prev) => prev.filter((s) => s.id !== id));
		}
	};

	return (
		<div className="flex-1 p-8 overflow-y-auto">
			{/* Header */}
			<div className="flex items-center justify-between mb-8">
				<div>
					<h1 className="text-2xl font-bold text-neutral-800">직원 관리</h1>
					<p className="text-neutral-500 mt-1">
						담당 디자이너 및 스탭을 관리합니다
					</p>
				</div>
				<button
					onClick={openAddModal}
					className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors"
				>
					<span className="material-symbols-outlined">add</span>
					직원 추가
				</button>
			</div>

			{/* Staff Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
				{staff.map((designer) => (
					<div
						key={designer.id}
						className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
					>
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-4">
								<div
									className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
									style={{ backgroundColor: designer.color }}
								>
									{designer.name.charAt(0)}
								</div>
								<div>
									<h3 className="font-bold text-neutral-800">
										{designer.name}
									</h3>
									<div className="flex items-center gap-2 mt-1">
										<span
											className="w-3 h-3 rounded-full"
											style={{ backgroundColor: designer.color }}
										/>
										<span className="text-sm text-neutral-500">
											{designer.color}
										</span>
									</div>
								</div>
							</div>
							<div className="flex gap-1">
								<button
									onClick={() => openEditModal(designer)}
									className="p-2 text-neutral-400 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
								>
									<span className="material-symbols-outlined text-xl">
										edit
									</span>
								</button>
								<button
									onClick={() => handleDelete(designer.id)}
									className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
								>
									<span className="material-symbols-outlined text-xl">
										delete
									</span>
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{staff.length === 0 && (
				<div className="text-center py-16">
					<span className="material-symbols-outlined text-6xl text-neutral-300 mb-4">
						badge
					</span>
					<p className="text-neutral-400">등록된 직원이 없습니다</p>
					<button
						onClick={openAddModal}
						className="mt-4 text-primary-500 font-bold hover:underline"
					>
						첫 번째 직원 추가하기
					</button>
				</div>
			)}

			{/* Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="bg-white rounded-2xl w-full max-w-md mx-4 overflow-hidden">
						<div className="p-6 border-b border-neutral-200">
							<h2 className="text-xl font-bold text-neutral-800">
								{editingStaff ? "직원 수정" : "직원 추가"}
							</h2>
						</div>
						<div className="p-6 space-y-6">
							{/* Name Input */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									이름
								</label>
								<input
									type="text"
									value={formData.name}
									onChange={(e) =>
										setFormData((prev) => ({ ...prev, name: e.target.value }))
									}
									placeholder="직원 이름을 입력하세요"
									className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
								/>
							</div>

							{/* Color Picker */}
							<div>
								<label className="block text-sm font-bold text-neutral-700 mb-2">
									색상
								</label>
								<div className="flex flex-wrap gap-3">
									{colorOptions.map((color) => (
										<button
											key={color}
											onClick={() =>
												setFormData((prev) => ({ ...prev, color }))
											}
											className={`w-10 h-10 rounded-full transition-transform ${
												formData.color === color
													? "ring-2 ring-offset-2 ring-primary-500 scale-110"
													: "hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>
						</div>
						<div className="p-6 bg-neutral-50 flex gap-3 justify-end">
							<button
								onClick={closeModal}
								className="px-4 py-2.5 text-neutral-600 font-bold hover:bg-neutral-200 rounded-xl transition-colors"
							>
								취소
							</button>
							<button
								onClick={handleSubmit}
								disabled={!formData.name.trim()}
								className="px-4 py-2.5 bg-primary-500 text-white font-bold rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{editingStaff ? "수정" : "추가"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
