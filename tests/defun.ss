(defmacro defun (name params body)
  (define name (lambda params body)))

(begin
  (defun product (x y) (* x y))
  (product 3 4))
