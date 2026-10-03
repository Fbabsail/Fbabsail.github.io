import json
from pathlib import Path
import pdfplumber

root = Path(__file__).resolve().parents[1] / '.test-artifacts'
def normalize(value):
    return ' '.join(value.replace('–', '-').replace('—', '-').split())

for filename in ['Faris_Babsail_Portfolio.pdf', 'future.pdf', 'no-projects.pdf']:
    with pdfplumber.open(root / filename) as pdf:
        text = normalize(' '.join(page.extract_text(use_text_flow=True) or '' for page in pdf.pages))
        for number, page in enumerate(pdf.pages, 1):
            words = page.extract_words()
            assert all(w['x0'] >= 35 and w['x1'] <= 577 and w['top'] >= 10 and w['bottom'] <= 778 for w in words), (filename, number, 'out of bounds')
            # A continuation page must contain real content, not only running headers.
            assert len(words) > 15, (filename, number, 'almost blank page')
        if filename == 'Faris_Babsail_Portfolio.pdf':
            model = json.loads((root / 'pdf-model.json').read_text(encoding='utf8'))
            expected_images = sum(len(p['images']) for p in model['projects'])
            assert sum(len(p.images) for p in pdf.pages) >= expected_images
            for project in model['projects']:
                assert normalize(project['title']) in text, project['title']
                for heading, items in project['sections']:
                    for item in items:
                        assert normalize(item) in text, item
        elif filename == 'future.pdf':
            assert '1-lb Combat Robot' not in text
            assert 'Unpublished draft must stay out' not in text
            assert 'Edited current project summary appears in the PDF.' in text
            # Page headers can interrupt a sentence split across a page boundary.
            assert text.count('pagination.') == 200
            assert text.count('introduction') == 30
            assert text.count('grows.') == 35
            assert text.count('clipping.') == 100
        else:
            assert sum(len(p.images) for p in pdf.pages) == 0
            assert '1-lb Combat Robot' not in text
        print(filename, len(pdf.pages), 'pages; text, bounds, membership and images verified')
