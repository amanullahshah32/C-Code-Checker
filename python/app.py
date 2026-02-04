"""
C Programming Autograder - Python Flask API
Provides grading functionality via REST API endpoints
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
import subprocess
from collections import defaultdict
import traceback

app = Flask(__name__)
CORS(app)

# Default configuration
DEFAULT_CONFIG = {
    'totalQuestions': 6,
    'marksPerQuestion': 2.5,
    'compilationTimeout': 60,
    'courseName': 'CSE115',
    'sectionName': 'Section 10',
    'assignmentName': 'Assignment 2'
}


# =============================================================================
# Filename Parser - Extracts student name and question number
# =============================================================================

def parse_filename(filename, total_questions=6):
    """
    Parse the filename to extract student name and question number.
    Handles multiple naming conventions from various students.
    
    Returns: (student_name, question_number, sub_part)
    """
    # Remove .c/.C extension
    base_name = filename.lower().replace('.c', '')
    original_base = filename.replace('.c', '').replace('.C', '')
    
    # Split by underscore
    parts = original_base.split('_')
    
    if len(parts) < 2:
        return None, None, None
    
    # Student name is always the first part (lowercase for consistency)
    student_name = parts[0].lower()
    
    # =========================================================================
    # SPECIAL PATTERNS FIRST (more specific)
    # =========================================================================
    
    # Pattern S1: "A-2-X" format (Assignment 2, Question X)
    match = re.search(r'a-2-(\d+)([a-z])?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S2: "CX" format (like C1, C2, C3)
    match = re.search(r'[_]c(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern S3: "PX" or "P X" or "pXa/pXb" format
    match = re.search(r'[_]p(\d+)\s*([a-z])?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S4: "2)ans XX" format
    match = re.search(r'2\)ans\s*(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern S4b: "2)ans XX part Y" format
    match = re.search(r'2\)ans\s*(\d+)\s*part\s*(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        part_num = int(match.group(2))
        sub_part = chr(ord('a') + part_num - 1) if part_num <= 26 else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S5: "X.0" format (like 1.0, 2.0, 3a.0)
    match = re.search(r'[_](\d+)([a-z])?\.0', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S6: "UntitledX" format
    match = re.search(r'untitled(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
        elif q_num <= total_questions + 2:
            return student_name, total_questions, chr(ord('a') + q_num - total_questions)
    
    # Pattern S7: "main-X" format (like main-1, main-2)
    match = re.search(r'main-(\d+)(?![a-f0-9\-])', base_name)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
        elif q_num == total_questions + 1:
            return student_name, total_questions, 'b'
    
    # Pattern S8: "Assighnment2.X" format (misspelled)
    match = re.search(r'assig[hn]+ment2\.(\d+)([a-z])?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S9: "cse115-X no" format
    match = re.search(r'cse115-?(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern S10: "NoX" or "no-X" or "no X" format
    match = re.search(r'no[_\-\s]?(\d+)([a-z])?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern S11: "Xa" or "Xb" standalone (like 5a, 5b, 6a)
    match = re.search(r'[_](\d)([a-z])(?:\.|\-|$)', base_name)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2)
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # =========================================================================
    # STANDARD PATTERNS
    # =========================================================================
    
    # Pattern 1: "question X(a)" or "question X(b)" format
    match = re.search(r'question[_\-\s]*(\d+)\s*\(?([a-z])?\)?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern 2: "problem X" or "problem-X" format
    match = re.search(r'problem[_\-\s]*(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern 3: "assignment X" or "assignment Xa/Xb" format
    match = re.search(r'assignment[_\-\s]*(\d+)\s*[\-]?([a-z])?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern 4: "Q-X" or "Q_X" or "QX" format with optional sub-part
    match = re.search(r'q[_\-\s]?(\d+)\s*[\-]?\s*\(?([a-z])?\)?', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2).lower() if match.group(2) else None
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Pattern 5: "aX" format (like a1, a2, a3)
    match = re.search(r'[_]a(\d+)', base_name, re.IGNORECASE)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern 6: Check last part for patterns
    last_part = parts[-1].lower()
    
    # Sub-pattern 6a: "Xa" or "X-a" format (e.g., 3a, 4b)
    match = re.match(r'^(\d+)[_\-]?([a-z])$', last_part)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2)
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Sub-pattern 6b: Just a number with suffix like "1-1", "2-3"
    match = re.match(r'^(\d+)[\-]?\d*$', last_part)
    if match:
        q_num = int(match.group(1))
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Sub-pattern 6c: Just a single number
    if last_part.isdigit():
        q_num = int(last_part)
        if 1 <= q_num <= total_questions:
            return student_name, q_num, None
    
    # Pattern 7: Handle special format "X(a)" or "X(b)"
    match = re.search(r'(\d)\(([a-z])\)', base_name)
    if match:
        q_num = int(match.group(1))
        sub_part = match.group(2)
        if 1 <= q_num <= total_questions:
            return student_name, q_num, sub_part
    
    # Return None if no pattern matched
    return student_name, None, None


def preprocess_files(submissions_dir, total_questions=6):
    """
    Pre-process files to map UUID-named files to Q1-QN based on submission order.
    Returns: {filename: (question_num, sub_part)}
    """
    file_mapping = {}
    
    # Get all C files
    try:
        all_files = os.listdir(submissions_dir)
    except FileNotFoundError:
        return file_mapping
        
    c_files = [f for f in all_files if f.lower().endswith('.c')]
    
    # Group files by student
    student_files_raw = defaultdict(list)
    for f in c_files:
        parts = f.split('_')
        if len(parts) >= 3:
            student = parts[0].lower()
            try:
                sub_id = int(parts[2])
                student_files_raw[student].append((sub_id, f))
            except:
                student_files_raw[student].append((0, f))
    
    # Process each student's files
    for student, files in student_files_raw.items():
        files.sort(key=lambda x: x[0])
        
        unassigned_files = []
        for sub_id, filename in files:
            name, q_num, sub_part = parse_filename(filename, total_questions)
            if q_num is None:
                unassigned_files.append((sub_id, filename))
        
        for i, (sub_id, filename) in enumerate(unassigned_files):
            if i < total_questions:
                q_num = i + 1
                file_mapping[filename] = (q_num, None)
            else:
                file_mapping[filename] = (total_questions, chr(ord('a') + i - total_questions + 1))
    
    return file_mapping


def parse_filename_enhanced(filename, file_mapping, total_questions=6):
    """Parse filename with fallback to pre-computed mapping"""
    student_name, q_num, sub_part = parse_filename(filename, total_questions)
    
    if q_num is not None:
        return student_name, q_num, sub_part
    
    if filename in file_mapping:
        parts = filename.split('_')
        student_name = parts[0].lower() if parts else None
        q_num, sub_part = file_mapping[filename]
        return student_name, q_num, sub_part
    
    return student_name, None, None


# =============================================================================
# Compilation Function
# =============================================================================

def compile_c_file(filepath, timeout=60):
    """
    Attempt to compile a C file using gcc.
    Returns: (success: bool, error_message: str or None)
    """
    base_name = os.path.splitext(os.path.basename(filepath))[0]
    temp_exe = os.path.join(os.path.dirname(filepath), f"{base_name}_temp.exe")
    
    try:
        result = subprocess.run(
            ["gcc", filepath, "-o", temp_exe],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        if result.returncode == 0:
            if os.path.exists(temp_exe):
                os.remove(temp_exe)
            return True, None
        else:
            error_msg = result.stderr.strip() if result.stderr else "Unknown compilation error"
            if os.path.exists(temp_exe):
                os.remove(temp_exe)
            return False, error_msg
            
    except subprocess.TimeoutExpired:
        if os.path.exists(temp_exe):
            os.remove(temp_exe)
        return False, f"Compilation timed out (exceeded {timeout} seconds)"
        
    except FileNotFoundError:
        return False, "gcc compiler not found. Please install gcc/MinGW."
        
    except Exception as e:
        if os.path.exists(temp_exe):
            os.remove(temp_exe)
        return False, f"Unexpected error: {str(e)}"


# =============================================================================
# Main Grading Function
# =============================================================================

def grade_submissions(submissions_dir, config):
    """
    Grade all C file submissions in the given directory.
    Returns detailed results for the frontend.
    """
    total_questions = config.get('totalQuestions', 6)
    marks_per_question = config.get('marksPerQuestion', 2.5)
    compilation_timeout = config.get('compilationTimeout', 60)
    total_marks = total_questions * marks_per_question
    
    # Pre-process for UUID mapping
    file_mapping = preprocess_files(submissions_dir, total_questions)
    
    # Data structures
    student_files = defaultdict(lambda: defaultdict(list))
    parsing_errors = []
    error_log = []
    
    # Get all C files
    try:
        all_files = os.listdir(submissions_dir)
    except FileNotFoundError:
        return {
            'success': False,
            'error': f'Directory not found: {submissions_dir}'
        }
    
    c_files = [f for f in all_files if f.lower().endswith('.c')]
    
    if not c_files:
        return {
            'success': False,
            'error': 'No .c files found in the uploaded files'
        }
    
    # Process each file
    compiled_ok = 0
    compiled_fail = 0
    
    for filename in sorted(c_files):
        filepath = os.path.join(submissions_dir, filename)
        
        student_name, question_num, sub_part = parse_filename_enhanced(
            filename, file_mapping, total_questions
        )
        
        if student_name is None or question_num is None:
            parsing_errors.append(filename)
            continue
        
        # Compile the file
        success, error_msg = compile_c_file(filepath, compilation_timeout)
        
        student_files[student_name][question_num].append({
            'filename': filename,
            'sub_part': sub_part,
            'compiled': success,
            'error': error_msg
        })
        
        if success:
            compiled_ok += 1
        else:
            compiled_fail += 1
            error_log.append({
                'student': student_name,
                'question': question_num,
                'filename': filename,
                'message': error_msg[:500] if error_msg else 'Unknown error'
            })
    
    # Calculate grades
    student_grades = {}
    students_with_errors = 0
    
    for student_name in sorted(student_files.keys()):
        student_grades[student_name] = {q: 0.0 for q in range(1, total_questions + 1)}
        has_errors = False
        
        for q_num in range(1, total_questions + 1):
            files = student_files[student_name][q_num]
            
            if not files:
                continue
            
            all_compiled = all(f['compiled'] for f in files)
            
            if all_compiled:
                student_grades[student_name][q_num] = marks_per_question
            else:
                has_errors = True
        
        if has_errors:
            students_with_errors += 1
    
    # Format results for frontend
    students_list = []
    all_totals = []
    
    for student_name in sorted(student_grades.keys()):
        grades = student_grades[student_name]
        total = sum(grades.values())
        all_totals.append(total)
        
        questions = [grades[q] for q in range(1, total_questions + 1)]
        students_list.append({
            'name': student_name,
            'questions': questions,
            'total': total
        })
    
    # Calculate statistics
    avg_score = sum(all_totals) / len(all_totals) if all_totals else 0
    max_score = max(all_totals) if all_totals else 0
    min_score = min(all_totals) if all_totals else 0
    perfect_scores = sum(1 for t in all_totals if t == total_marks)
    
    # Grade distribution
    score_counts = defaultdict(int)
    for t in all_totals:
        score_counts[t] += 1
    
    distribution = [
        {'score': score, 'count': count}
        for score, count in sorted(score_counts.items(), reverse=True)
    ]
    
    return {
        'success': True,
        'totalStudents': len(student_grades),
        'totalFiles': len(c_files),
        'compiledOk': compiled_ok,
        'compiledFail': compiled_fail,
        'parsingErrors': len(parsing_errors),
        'averageScore': round(avg_score, 2),
        'highestScore': max_score,
        'lowestScore': min_score,
        'perfectScores': perfect_scores,
        'studentsWithErrors': students_with_errors,
        'students': students_list,
        'distribution': distribution,
        'errorLog': error_log,
        'totalMarks': total_marks
    }


# =============================================================================
# Flask API Routes
# =============================================================================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'Python Grading API is running'
    })


@app.route('/grade', methods=['POST'])
def grade():
    """Main grading endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        session_dir = data.get('sessionDir')
        config = data.get('config', DEFAULT_CONFIG)
        
        if not session_dir:
            return jsonify({'success': False, 'error': 'No session directory provided'}), 400
        
        if not os.path.exists(session_dir):
            return jsonify({'success': False, 'error': f'Directory not found: {session_dir}'}), 400
        
        # Merge with defaults
        full_config = {**DEFAULT_CONFIG, **config}
        
        # Run grading
        results = grade_submissions(session_dir, full_config)
        
        if not results.get('success', False):
            return jsonify(results), 400
        
        return jsonify(results)
        
    except Exception as e:
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/test-parse', methods=['POST'])
def test_parse():
    """Test filename parsing"""
    try:
        data = request.get_json()
        filename = data.get('filename', '')
        total_questions = data.get('totalQuestions', 6)
        
        student, question, sub_part = parse_filename(filename, total_questions)
        
        return jsonify({
            'filename': filename,
            'student': student,
            'question': question,
            'subPart': sub_part
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# =============================================================================
# Main Entry Point
# =============================================================================

if __name__ == '__main__':
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║   🐍 Python Grading API                                   ║
    ║                                                           ║
    ║   Server running on: http://localhost:8000                ║
    ║   Endpoints:                                              ║
    ║     GET  /health     - Health check                       ║
    ║     POST /grade      - Grade submissions                  ║
    ║     POST /test-parse - Test filename parsing              ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=8000, debug=True)
