import { useEffect, useRef, useState } from "react";

// Counter hook for animated numbers
function useCountUp(
	end: number,
	duration: number = 2000,
	startOnView: boolean = true,
) {
	const [count, setCount] = useState(0);
	const [hasStarted, setHasStarted] = useState(!startOnView);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (startOnView && ref.current) {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						setHasStarted(true);
						observer.disconnect();
					}
				},
				{ threshold: 0.3 },
			);
			observer.observe(ref.current);
			return () => observer.disconnect();
		}
	}, [startOnView]);

	useEffect(() => {
		if (!hasStarted) return;

		let startTime: number;
		const animate = (currentTime: number) => {
			if (!startTime) startTime = currentTime;
			const progress = Math.min((currentTime - startTime) / duration, 1);
			setCount(Math.floor(progress * end));
			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};
		requestAnimationFrame(animate);
	}, [end, duration, hasStarted]);

	return { count, ref };
}

// Feature card component
function FeatureCard({
	icon,
	title,
	description,
	delay,
}: {
	icon: React.ReactNode;
	title: string;
	description: string;
	delay: number;
}) {
	return (
		<div
			className="bg-white rounded-2xl p-8 shadow-lg shadow-neutral-200/50 hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
			style={{ animationDelay: `${delay}s` }}
		>
			<div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center mb-5">
				{icon}
			</div>
			<h3 className="font-display text-xl font-semibold text-neutral-800 mb-3">
				{title}
			</h3>
			<p className="text-neutral-500 leading-relaxed">{description}</p>
		</div>
	);
}

// Stats card
function StatCard({
	value,
	suffix,
	label,
	trend,
	delay,
}: {
	value: number;
	suffix: string;
	label: string;
	trend?: string;
	delay: number;
}) {
	const { count, ref } = useCountUp(value, 2000);

	return (
		<div
			ref={ref}
			className="text-center animate-fade-in-up"
			style={{ animationDelay: `${delay}s` }}
		>
			<div className="font-display text-5xl md:text-6xl font-bold text-neutral-900 mb-2">
				{count.toLocaleString()}
				{suffix}
			</div>
			{trend && (
				<div className="inline-flex items-center gap-1 text-success-600 text-sm font-medium mb-2 bg-success-400/10 px-2 py-0.5 rounded-full">
					<svg
						className="w-3 h-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 10l7-7m0 0l7 7m-7-7v18"
						/>
					</svg>
					{trend}
				</div>
			)}
			<div className="text-neutral-500 font-medium">{label}</div>
		</div>
	);
}

// Dashboard preview component
function DashboardPreview() {
	const chartData = [30, 45, 35, 55, 40, 65, 50, 75, 60, 85, 70, 90];

	return (
		<div className="bg-white rounded-3xl shadow-2xl shadow-neutral-300/30 overflow-hidden border border-neutral-100">
			{/* Browser chrome */}
			<div className="bg-neutral-100 px-4 py-3 flex items-center gap-2">
				<div className="flex gap-1.5">
					<div className="w-3 h-3 rounded-full bg-red-400" />
					<div className="w-3 h-3 rounded-full bg-amber-400" />
					<div className="w-3 h-3 rounded-full bg-green-400" />
				</div>
				<div className="flex-1 mx-4">
					<div className="bg-white rounded-lg px-4 py-1.5 text-sm text-neutral-400 w-full max-w-md">
						mariem.app/dashboard
					</div>
				</div>
			</div>

			{/* Dashboard content */}
			<div className="p-6 bg-gradient-to-br from-neutral-50 to-white">
				{/* Top stats row */}
				<div className="grid grid-cols-3 gap-4 mb-6">
					<div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
						<div className="text-sm text-neutral-500 mb-1">오늘 매출</div>
						<div className="font-display text-2xl font-bold text-neutral-800">
							₩1,250,000
						</div>
						<div className="flex items-center gap-1 text-success-600 text-xs mt-1">
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 10l7-7m0 0l7 7m-7-7v18"
								/>
							</svg>
							+23% vs 어제
						</div>
					</div>
					<div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
						<div className="text-sm text-neutral-500 mb-1">거래 건수</div>
						<div className="font-display text-2xl font-bold text-neutral-800">
							28건
						</div>
						<div className="flex items-center gap-1 text-success-600 text-xs mt-1">
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M5 10l7-7m0 0l7 7m-7-7v18"
								/>
							</svg>
							+5건
						</div>
					</div>
					<div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-100">
						<div className="text-sm text-neutral-500 mb-1">신규 고객</div>
						<div className="font-display text-2xl font-bold text-neutral-800">
							7명
						</div>
						<div className="flex items-center gap-1 text-accent-600 text-xs mt-1">
							<svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
							신규 회원
						</div>
					</div>
				</div>

				{/* Chart area */}
				<div className="bg-white rounded-xl p-5 shadow-sm border border-neutral-100">
					<div className="flex items-center justify-between mb-4">
						<div className="font-display font-semibold text-neutral-800">
							월간 매출 추이
						</div>
						<div className="flex gap-2">
							<span className="text-xs px-2 py-1 bg-primary-50 text-primary-700 rounded-md">
								올해
							</span>
							<span className="text-xs px-2 py-1 text-neutral-400">작년</span>
						</div>
					</div>
					<div className="flex items-end justify-between h-32 gap-2">
						{chartData.map((value, i) => (
							<div key={i} className="flex-1 flex flex-col items-center gap-1">
								<div
									className="w-full rounded-t-md bg-gradient-to-t from-primary-500 to-primary-400 animate-grow-up"
									style={{
										height: `${value}%`,
										animationDelay: `${0.5 + i * 0.08}s`,
									}}
								/>
								<span className="text-[10px] text-neutral-400">{i + 1}월</span>
							</div>
						))}
					</div>
				</div>

				{/* Insight card */}
				<div className="mt-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 border border-primary-100">
					<div className="flex items-start gap-3">
						<div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
							<svg
								className="w-4 h-4 text-primary-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div>
							<div className="font-display font-semibold text-neutral-800 text-sm mb-1">
								AI 인사이트
							</div>
							<p className="text-xs text-neutral-600 leading-relaxed">
								<span className="text-primary-700 font-medium">김디자이너</span>
								의 펌 시술 재방문율이
								<span className="text-success-600 font-medium"> 87%</span>로
								매우 높습니다. 펌 프로모션 진행 시 담당 배정을 권장합니다.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Main Landing Page
export default function LandingPage() {
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="min-h-screen bg-white">
			{/* Navigation */}
			<nav
				className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
					isScrolled
						? "bg-white shadow-sm border-b border-neutral-100"
						: "bg-white"
				}`}
			>
				<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
							<svg
								className="w-6 h-6 text-white"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<span className="font-display text-xl font-bold text-neutral-900">
							Mariem
						</span>
					</div>
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#features"
							className="text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							기능
						</a>
						<a
							href="#pricing"
							className="text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							요금제
						</a>
						<a
							href="#contact"
							className="text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							문의
						</a>
					</div>
					<div className="flex items-center gap-3">
						<button className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
							로그인
						</button>
						<button className="bg-primary-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors">
							무료 시작
						</button>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-6 bg-neutral-50">
				<div className="max-w-7xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						{/* Left content */}
						<div className="animate-fade-in-up">
							<div className="inline-flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-full mb-6">
								<span className="w-2 h-2 rounded-full bg-primary-500" />
								<span className="text-sm text-primary-700 font-medium">
									데이터 기반 미용실 성장 플랫폼
								</span>
							</div>

							<h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight mb-6">
								거래 입력 하나로
								<br />
								<span className="text-primary-600">매출 분석부터 전략까지</span>
							</h1>

							<p className="text-lg text-neutral-600 leading-relaxed mb-8 max-w-lg">
								복잡한 엑셀은 이제 그만. 터치 몇 번으로 거래를 입력하면,
								<strong className="text-neutral-900">
									{" "}
									AI가 자동으로 성과를 분석
								</strong>
								하고 매출 성장 전략을 제안합니다.
							</p>

							<div className="flex flex-col sm:flex-row gap-4 mb-8">
								<button className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors">
									14일 무료 체험 시작
								</button>
								<button className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-medium text-neutral-700 bg-white hover:bg-neutral-50 transition-colors border border-neutral-200">
									<svg
										className="w-5 h-5"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
											clipRule="evenodd"
										/>
									</svg>
									2분 영상 보기
								</button>
							</div>

							<div className="flex items-center gap-6 text-sm text-neutral-500">
								<div className="flex items-center gap-2">
									<svg
										className="w-4 h-4 text-success-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									카드 등록 불필요
								</div>
								<div className="flex items-center gap-2">
									<svg
										className="w-4 h-4 text-success-500"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
											clipRule="evenodd"
										/>
									</svg>
									5분 만에 시작
								</div>
							</div>
						</div>

						{/* Right - Dashboard preview */}
						<div
							className="animate-fade-in-up animate-float"
							style={{ animationDelay: "0.3s" }}
						>
							<DashboardPreview />
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 px-6 bg-white border-y border-neutral-100">
				<div className="max-w-5xl mx-auto">
					<div className="grid md:grid-cols-3 gap-12">
						<StatCard
							value={324}
							suffix="%"
							label="평균 매출 분석 정확도 향상"
							trend="+32% 월간"
							delay={0}
						/>
						<StatCard
							value={2847}
							suffix="+"
							label="사용 중인 미용실"
							delay={0.1}
						/>
						<StatCard
							value={15}
							suffix="분"
							label="일평균 관리 시간 절약"
							trend="하루 1시간"
							delay={0.2}
						/>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section id="features" className="py-24 px-6 bg-neutral-50">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
							데이터가 <span className="text-primary-600">말해주는</span> 성장
							전략
						</h2>
						<p className="text-lg text-neutral-500 max-w-2xl mx-auto">
							IT를 몰라도 괜찮아요. 터치 한 번으로 거래를 입력하면, 나머지는
							Mariem이 알아서 해드립니다.
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<FeatureCard
							delay={0}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
									/>
								</svg>
							}
							title="터치 3번, 거래 완료"
							description="복잡한 폼 입력은 이제 그만. 고객 선택, 시술 선택, 결제 - 단 3단계로 거래 입력이 끝납니다."
						/>
						<FeatureCard
							delay={0.1}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
									/>
								</svg>
							}
							title="실시간 매출 대시보드"
							description="일별, 월별, 디자이너별, 시술별 매출을 한눈에. 엑셀 없이도 사장님이 원하는 모든 분석을 제공합니다."
						/>
						<FeatureCard
							delay={0.2}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
							}
							title="AI 성장 인사이트"
							description="어떤 시술이 인기인지, 어떤 디자이너가 성장 중인지, 언제 프로모션을 해야 하는지 AI가 알려드립니다."
						/>
						<FeatureCard
							delay={0.3}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							}
							title="고객 히스토리 관리"
							description="단골 고객의 시술 이력, 선호도, 마지막 방문일까지. 고객이 오면 바로 맞춤 서비스가 가능합니다."
						/>
						<FeatureCard
							delay={0.4}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
									/>
								</svg>
							}
							title="정액권 & 분할결제"
							description="정액권 잔액 자동 관리, 카드+현금 분할결제도 한 번에. 복잡한 정산도 깔끔하게 처리됩니다."
						/>
						<FeatureCard
							delay={0.5}
							icon={
								<svg
									className="w-7 h-7 text-primary-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
									/>
								</svg>
							}
							title="안전한 데이터 보관"
							description="모든 데이터는 암호화되어 클라우드에 안전하게 보관. 기기가 바뀌어도 데이터는 그대로입니다."
						/>
					</div>
				</div>
			</section>

			{/* Social Proof */}
			<section className="py-20 px-6 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
				<div className="max-w-4xl mx-auto text-center">
					<div className="inline-flex items-center gap-1 mb-6">
						{[...Array(5)].map((_, i) => (
							<svg
								key={i}
								className="w-6 h-6 text-accent-400"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
							</svg>
						))}
					</div>

					<blockquote className="font-display text-2xl md:text-3xl font-medium leading-relaxed mb-8">
						"엑셀로 매출 정리하느라 매일 밤 1시간씩 썼는데, 이제는 퇴근 후
						<span className="text-accent-300"> 앱에서 오늘 성과만 확인</span>
						하면 끝이에요. 디자이너별 성과가 한눈에 보여서 인센티브 정산도
						쉬워졌고요."
					</blockquote>

					<div className="flex items-center justify-center gap-4">
						<div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-display font-bold text-lg">
							JH
						</div>
						<div className="text-left">
							<div className="font-semibold">김정희 원장님</div>
							<div className="text-primary-200 text-sm">
								헤어라운지 강남점 · 사용 8개월
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-24 px-6 bg-white">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
						지금 바로 시작하세요
					</h2>
					<p className="text-lg text-neutral-500 mb-8 max-w-xl mx-auto">
						복잡한 설정 없이 5분이면 시작할 수 있습니다.
						<br />
						14일 무료 체험 후 결정하세요.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
						<button className="bg-primary-600 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors">
							무료로 시작하기
						</button>
						<span className="text-neutral-400">또는</span>
						<button className="text-primary-600 font-medium hover:text-primary-700 transition-colors underline underline-offset-4">
							데모 미팅 예약하기
						</button>
					</div>

					<div className="flex flex-wrap justify-center gap-6 text-sm text-neutral-500">
						<div className="flex items-center gap-2">
							<svg
								className="w-5 h-5 text-success-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							14일 무료 체험
						</div>
						<div className="flex items-center gap-2">
							<svg
								className="w-5 h-5 text-success-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							카드 등록 불필요
						</div>
						<div className="flex items-center gap-2">
							<svg
								className="w-5 h-5 text-success-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							언제든 취소 가능
						</div>
						<div className="flex items-center gap-2">
							<svg
								className="w-5 h-5 text-success-500"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
									clipRule="evenodd"
								/>
							</svg>
							1:1 온보딩 지원
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="py-12 px-6 bg-neutral-900 text-neutral-400">
				<div className="max-w-7xl mx-auto">
					<div className="grid md:grid-cols-4 gap-8 mb-12">
						<div>
							<div className="flex items-center gap-2 mb-4">
								<div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
									<svg
										className="w-5 h-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								</div>
								<span className="font-display text-lg font-bold text-white">
									Mariem
								</span>
							</div>
							<p className="text-sm leading-relaxed">
								데이터 기반 미용실 성장 플랫폼.
								<br />
								거래 입력부터 성과 분석까지.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-white mb-4">제품</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										기능 소개
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										요금제
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										업데이트
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-white mb-4">지원</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										고객센터
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										사용 가이드
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										자주 묻는 질문
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h4 className="font-semibold text-white mb-4">회사</h4>
							<ul className="space-y-2 text-sm">
								<li>
									<a href="#" className="hover:text-white transition-colors">
										회사 소개
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										채용
									</a>
								</li>
								<li>
									<a href="#" className="hover:text-white transition-colors">
										블로그
									</a>
								</li>
							</ul>
						</div>
					</div>

					<div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
						<div className="text-sm">© 2025 Mariem. All rights reserved.</div>
						<div className="flex gap-6 text-sm">
							<a href="#" className="hover:text-white transition-colors">
								이용약관
							</a>
							<a href="#" className="hover:text-white transition-colors">
								개인정보처리방침
							</a>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
