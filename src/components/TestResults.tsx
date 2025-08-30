import React from 'react';
import { Download, RotateCcw, GraduationCap, BookOpen, Headphones, PenTool, MessageSquare } from 'lucide-react';
import { StudentInfo } from '../types/test';
import { SEMFScoringEngine } from '../utils/semfScoring';
import jsPDF from 'jspdf';

interface TestResultsProps {
  answers: Record<number, string>;
  studentInfo: StudentInfo | null;
  onRestart: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({ answers, studentInfo, onRestart }) => {
  const calculateRawScores = () => {
    // Grammar & Vocabulary (Questions 1-20) - tie-breaker only
    const grammarAnswers = Object.entries(answers).filter(([id]) => parseInt(id) >= 1 && parseInt(id) <= 20);
    const grammarScore = Math.floor(grammarAnswers.length * 0.8); // Simulate 80% score
    
    // Reading & Writing (Questions 21-44)
    const readingWritingAnswers = Object.entries(answers).filter(([id]) => parseInt(id) >= 21 && parseInt(id) <= 44);
    const readingWritingScore = Math.floor(readingWritingAnswers.length * 0.75); // Simulate 75% score
    
    // Listening (Questions 45-56)
    const listeningAnswers = Object.entries(answers).filter(([id]) => parseInt(id) >= 45 && parseInt(id) <= 56);
    const listeningScore = Math.floor(listeningAnswers.length * 0.8); // Simulate 80% score
    
    return {
      GrammarVocabulary: Math.min(grammarScore, 20),
      ReadingWriting: Math.min(readingWritingScore, 24),
      Listening: Math.min(listeningScore, 12)
    };
  };

  const rawScores = calculateRawScores();
  const semfResult = SEMFScoringEngine.calculateSEMFLevel(rawScores);

  const getSEMFLevelColor = (level: string) => {
    switch (level) {
      case 'S5': return { bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50', border: 'border-purple-300' };
      case 'S4': return { bg: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-50', border: 'border-blue-300' };
      case 'S3': return { bg: 'bg-teal-500', text: 'text-teal-600', bgLight: 'bg-teal-50', border: 'border-teal-300' };
      case 'S2': return { bg: 'bg-yellow-500', text: 'text-yellow-600', bgLight: 'bg-yellow-50', border: 'border-yellow-300' };
      case 'S1': return { bg: 'bg-red-500', text: 'text-red-600', bgLight: 'bg-red-50', border: 'border-red-300' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600', bgLight: 'bg-gray-50', border: 'border-gray-300' };
    }
  };

  const overallLevelColor = getSEMFLevelColor(semfResult.overallLevel);

  const handleDownload = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      
      // Set default font
      pdf.setFont('helvetica');
      
      // Header with college branding
      pdf.setFillColor(30, 64, 175);
      pdf.rect(0, 0, pageWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SHA BRIDGE COLLEGE', margin, 12);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('English Mastery Framework (SEMF) Assessment', margin, 18);
      
      yPosition = 35;
      
      // Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEMF ENGLISH PROFICIENCY TEST RESULTS', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      
      // Student Information Box
      pdf.setFillColor(240, 240, 240);
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.roundedRect(margin, yPosition, contentWidth, 25, 3, 3, 'S');
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('STUDENT INFORMATION', margin + 5, yPosition + 7);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      if (studentInfo) {
        pdf.text(`Name: ${studentInfo.firstName} ${studentInfo.lastName}`, margin + 5, yPosition + 14);
        pdf.text(`Test Date: ${new Date().toLocaleDateString()}`, margin + contentWidth/2, yPosition + 14);
        pdf.text(`Self-Assessed Level: ${studentInfo.level}`, margin + 5, yPosition + 20);
      }
      
      yPosition += 30;
      
      // Main Score Section
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
      pdf.setDrawColor(200, 200, 200);
      pdf.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'S');
      
      // Overall SEMF Level Badge
      const badgeWidth = 50;
      const badgeX = pageWidth - margin - badgeWidth;
      
      // Set badge color based on SEMF level
      if (semfResult.overallLevel === 'S5') pdf.setFillColor(147, 51, 234);
      else if (semfResult.overallLevel === 'S4') pdf.setFillColor(37, 99, 235);
      else if (semfResult.overallLevel === 'S3') pdf.setFillColor(20, 184, 166);
      else if (semfResult.overallLevel === 'S2') pdf.setFillColor(245, 158, 11);
      else pdf.setFillColor(239, 68, 68);
      
      pdf.roundedRect(badgeX, yPosition + 8, badgeWidth, 15, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`SEMF ${semfResult.overallLevel}`, badgeX + badgeWidth/2, yPosition + 17, { align: 'center' });
      
      // Overall level description
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('OVERALL SEMF LEVEL', margin + 5, yPosition + 12);
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175);
      pdf.text(semfResult.overallLevel, margin + 5, yPosition + 22);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(semfResult.descriptions[semfResult.overallLevel], margin + 5, yPosition + 27);
      
      yPosition += 35;
      
      // Skills Breakdown
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SKILLS BREAKDOWN', margin, yPosition);
      
      yPosition += 8;
      
      // Skills in a grid
      const skillWidth = (contentWidth - 10) / 2;
      const skillHeight = 25;
      
      semfResult.skills.forEach((skill, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = margin + (col * (skillWidth + 10));
        const y = yPosition + (row * (skillHeight + 5));
        
        // Skill box
        pdf.setFillColor(248, 248, 248);
        pdf.roundedRect(x, y, skillWidth, skillHeight, 2, 2, 'F');
        pdf.setDrawColor(220, 220, 220);
        pdf.roundedRect(x, y, skillWidth, skillHeight, 2, 2, 'S');
        
        // Skill name and scores
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(skill.skill.replace(/([A-Z])/g, ' $1').trim(), x + 5, y + 8);
        
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Raw: ${skill.rawScore} | Normalized: ${skill.normalizedScore}`, x + 5, y + 14);
        
        // SEMF Level
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175);
        pdf.text(`SEMF ${skill.level}`, x + skillWidth - 5, y + 12, { align: 'right' });
        
        // Tie-breaker indicator
        if (skill.tieBreakerApplied) {
          pdf.setFontSize(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(200, 100, 0);
          pdf.text('(Tie-breaker applied)', x + 5, y + 20);
        }
      });
      
      yPosition += 60;
      
      // Tie-breaker skill
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('TIE-BREAKER SKILL', margin, yPosition);
      
      yPosition += 8;
      
      pdf.setFillColor(255, 248, 220);
      pdf.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
      pdf.setDrawColor(245, 158, 11);
      pdf.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'S');
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`${semfResult.tieBreakerSkill.skill}: ${semfResult.tieBreakerSkill.rawScore}/20 (Normalized: ${semfResult.tieBreakerSkill.normalizedScore})`, margin + 5, yPosition + 10);
      
      yPosition += 20;
      
      // SEMF Level Guide
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEMF LEVEL GUIDE', margin, yPosition);
      
      yPosition += 8;
      
      const semfLevels = [
        { level: 'S1', label: 'Basic', points: '0-15 points', color: [239, 68, 68] },
        { level: 'S2', label: 'Elementary', points: '16-25 points', color: [245, 158, 11] },
        { level: 'S3', label: 'Independent', points: '26-33 points', color: [20, 184, 166] },
        { level: 'S4', label: 'Proficient', points: '34-42 points', color: [37, 99, 235] },
        { level: 'S5', label: 'Mastery', points: '43-50 points', color: [147, 51, 234] }
      ];
      
      // Draw SEMF levels in grid
      const levelWidth = (contentWidth - 20) / 3;
      const levelHeight = 15;
      
      semfLevels.forEach((level, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = margin + (col * (levelWidth + 10));
        const y = yPosition + (row * (levelHeight + 5));
        
        // Highlight current level
        const isCurrentLevel = level.level === semfResult.overallLevel;
        
        if (isCurrentLevel) {
          pdf.setFillColor(level.color[0], level.color[1], level.color[2]);
          pdf.setDrawColor(level.color[0], level.color[1], level.color[2]);
        } else {
          pdf.setFillColor(248, 248, 248);
          pdf.setDrawColor(220, 220, 220);
        }
        
        pdf.roundedRect(x, y, levelWidth, levelHeight, 2, 2, 'FD');
        
        // Level text
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(isCurrentLevel ? 255 : 0, isCurrentLevel ? 255 : 0, isCurrentLevel ? 255 : 0);
        pdf.text(level.level, x + 3, y + 6);
        
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'normal');
        pdf.text(level.label, x + 3, y + 10);
        pdf.text(level.points, x + 3, y + 13);
      });
      
      yPosition += 45;
      
      // Footer
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text('Sha Bridge College English Mastery Framework (SEMF) Assessment', pageWidth / 2, pageHeight - 14, { align: 'center' });
      pdf.setFontSize(7);
      pdf.text('For official certification or academic placement, please contact our Academic Affairs office.', pageWidth / 2, pageHeight - 8, { align: 'center' });
      
      pdf.save(`Sha_Bridge_College_SEMF_Assessment_${studentInfo?.lastName || 'Student'}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <img src="https://copilot.microsoft.com/th/id/BCO.1671fab5-16d2-493f-999e-daadcc92b63b.png" alt="Sha Bridge College Logo" className="w-8 h-8" onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }} />
            <GraduationCap className="w-8 h-8 text-blue-900 hidden" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Sha Bridge College</h1>
              <p className="text-sm text-gray-600">SEMF English Assessment Results</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="results-container">
          {/* Main Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-3">Assessment Complete!</h1>
            <p className="text-lg text-gray-600">Your ShaBridge English Mastery Framework (SEMF) Results</p>
          </div>

          {/* Main Score Display */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-10 mb-8 text-center">
            <div className="mb-6">
              <div className={`inline-block ${overallLevelColor.bg} text-white px-8 py-4 rounded-full font-bold text-3xl shadow-lg mb-4`}>
                SEMF {semfResult.overallLevel}
              </div>
              <div className="text-xl text-gray-600 max-w-2xl mx-auto">
                {semfResult.descriptions[semfResult.overallLevel]}
              </div>
            </div>

            {/* Skills Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {semfResult.skills.map((skill) => {
                const skillColor = getSEMFLevelColor(skill.level);
                return (
                  <div key={skill.skill} className={`${skillColor.bgLight} ${skillColor.border} border-2 rounded-xl p-6`}>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      {skill.skill.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Raw Score: {skill.rawScore}</span>
                      <span className={`font-bold text-lg ${skillColor.text}`}>SEMF {skill.level}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Normalized: {skill.normalizedScore}/50
                      {skill.tieBreakerApplied && (
                        <span className="ml-2 text-amber-600 font-medium">(Tie-breaker applied)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tie-breaker Skill */}
            <div className="mt-6 bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-2">Tie-breaker Skill</h3>
              <div className="text-amber-700">
                <span className="font-medium">{semfResult.tieBreakerSkill.skill.replace(/([A-Z])/g, ' $1').trim()}: </span>
                {semfResult.tieBreakerSkill.rawScore}/20 (Normalized: {semfResult.tieBreakerSkill.normalizedScore}/50)
              </div>
              <p className="text-sm text-amber-600 mt-2">
                Used to determine final level when scores are near boundaries
              </p>
            </div>
          </div>

          {/* Student Information Display */}
          {studentInfo && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Student Information</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Name:</span> {studentInfo.firstName} {studentInfo.lastName}</div>
                  <div><span className="font-medium">Email:</span> {studentInfo.email}</div>
                  <div><span className="font-medium">Phone:</span> {studentInfo.phoneNumber}</div>
                  <div><span className="font-medium">Self-Assessed Level:</span> {studentInfo.level}</div>
                  <div><span className="font-medium">Test Date:</span> {new Date().toLocaleDateString()}</div>
                  <div><span className="font-medium">Assessment Type:</span> SEMF Core Skills</div>
                </div>
              </div>
            </div>
          )}

          {/* SEMF Level Guide */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">SEMF Level Guide</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* S1 */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                semfResult.overallLevel === 'S1' ? 'border-red-400 bg-red-50 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-xl font-bold text-gray-800">S1</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-lg">Basic User</div>
                  <div className="text-sm">0-15 points</div>
                  <div className="text-xs mt-2">Understands and uses simple expressions</div>
                </div>
              </div>

              {/* S2 */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                semfResult.overallLevel === 'S2' ? 'border-yellow-400 bg-yellow-50 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-xl font-bold text-gray-800">S2</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-lg">Elementary User</div>
                  <div className="text-sm">16-25 points</div>
                  <div className="text-xs mt-2">Can handle short, routine exchanges</div>
                </div>
              </div>

              {/* S3 */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                semfResult.overallLevel === 'S3' ? 'border-teal-400 bg-teal-50 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
                  <span className="text-xl font-bold text-gray-800">S3</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-lg">Independent User</div>
                  <div className="text-sm">26-33 points</div>
                  <div className="text-xs mt-2">Can deal with most everyday situations</div>
                </div>
              </div>

              {/* S4 */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                semfResult.overallLevel === 'S4' ? 'border-blue-400 bg-blue-50 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  <span className="text-xl font-bold text-gray-800">S4</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-lg">Proficient User</div>
                  <div className="text-sm">34-42 points</div>
                  <div className="text-xs mt-2">Can interact fluently and spontaneously</div>
                </div>
              </div>

              {/* S5 */}
              <div className={`border-2 rounded-xl p-6 transition-all ${
                semfResult.overallLevel === 'S5' ? 'border-purple-400 bg-purple-50 shadow-lg' : 'border-gray-200 hover:shadow-md'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                  <span className="text-xl font-bold text-gray-800">S5</span>
                </div>
                <div className="text-gray-600">
                  <div className="font-semibold text-lg">Mastery</div>
                  <div className="text-sm">43-50 points</div>
                  <div className="text-xs mt-2">Can express ideas precisely in complex situations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={onRestart}
              className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <RotateCcw className="w-5 h-5" />
              Take Test Again
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Download SEMF Report
            </button>
          </div>

          {/* Footer */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <img src="https://copilot.microsoft.com/th/id/BCO.1671fab5-16d2-493f-999e-daadcc92b63b.png" alt="Sha Bridge College Logo" className="w-6 h-6" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <GraduationCap className="w-6 h-6 text-blue-900 hidden" />
              <span className="text-lg font-bold text-blue-900">Sha Bridge College SEMF Assessment Center</span>
            </div>
            <p className="text-blue-700">
              This SEMF assessment provides an indication of your current English proficiency level using our proprietary framework.
              For official certification or academic placement, please contact our Academic Affairs office.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};