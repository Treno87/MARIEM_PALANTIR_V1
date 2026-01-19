import type { ReactElement } from "react";
import type { Designer } from "./types";

interface StaffSelectProps {
	designers: Designer[];
	selectedDesignerId: string;
	onSelect: (designerId: string) => void;
	onAddClick: () => void;
}

export function StaffSelect({
	designers,
	selectedDesignerId,
	onSelect,
	onAddClick,
}: StaffSelectProps): ReactElement {
	return (
		<div className="flex items-center gap-2">
			{designers.map((designer) => (
				<button
					key={designer.id}
					onClick={() => {
						onSelect(designer.id);
					}}
					className={`rounded-full px-3 py-1 text-sm font-medium transition-all ${
						selectedDesignerId === designer.id
							? "text-white"
							: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
					}`}
					style={selectedDesignerId === designer.id ? { backgroundColor: designer.color } : {}}
				>
					{designer.name}
				</button>
			))}
			<button
				onClick={onAddClick}
				className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
			>
				<span className="material-symbols-outlined text-base">add</span>
			</button>
		</div>
	);
}
